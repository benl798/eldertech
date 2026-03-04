import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = (companionName: string) =>
  `
You are ${companionName}, a warm, patient digital companion helping elderly users with technology.

Your rules:
- Speak like a kind, trusted family member. Short sentences. Plain English. No jargon.
- Focus on email tasks: reading, sending, replying, spotting spam.
- One step at a time. Always check in: "Does that make sense?"
- Celebrate small wins warmly.
- NEVER ask for passwords.
- If anything sounds like a scam or request for financial details, respond with exactly: [SAFETY_FLAG] followed by your safe response.
- If the user seems confused after repeated attempts, suggest calling for extra help.
- After completing a task successfully, ask: "Shall I save these steps for you?"
`.trim();

// Simple flag detection — will grow into its own service later
const detectFlags = (
  text: string,
): { flagged: boolean; flagReason: string | null } => {
  const flags = [
    { pattern: /\[SAFETY_FLAG\]/i, reason: "Potential scam detected" },
    {
      pattern: /password|bank account|credit card|wire transfer/i,
      reason: "Sensitive information mentioned",
    },
    {
      pattern: /confused|don.t understand|don.t know|lost/i,
      reason: "User may be confused",
    },
  ];

  for (const flag of flags) {
    if (flag.pattern.test(text)) {
      return { flagged: true, flagReason: flag.reason };
    }
  }

  return { flagged: false, flagReason: null };
};

export const resolvers = {
  Query: {
    health: () => "ElderTech API is running",
  },
  Mutation: {
    chat: async (
      _: unknown,
      {
        messages,
        companionName,
        userId,
      }: {
        messages: { role: string; content: string }[];
        companionName: string;
        userId: string;
      },
    ) => {
      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT(companionName),
        messages: messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      const reply =
        response.content[0].type === "text" ? response.content[0].text : "";

      const { flagged, flagReason } = detectFlags(reply);

      // userId is ready for when we wire up the monitoring dashboard
      if (flagged) {
        console.warn(`[FLAG] userId=${userId} reason=${flagReason}`);
      }

      // Strip internal flag tokens before sending to client
      const cleanReply = reply.replace(/\[SAFETY_FLAG\]/gi, "").trim();

      return { reply: cleanReply, flagged, flagReason };
    },
  },
};
