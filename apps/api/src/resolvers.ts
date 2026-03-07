import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import prisma from "./db";

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
- After completing a task successfully, you MUST end your message with this exact sentence: "Shall I save these steps for you? That way you'll have them to look back on anytime." Do not paraphrase this. Do not replace it with alternatives.
`.trim();

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

// Generate a short title from the first user message
const generateTitle = (firstUserMessage: string): string => {
  const truncated = firstUserMessage.slice(0, 50);
  return truncated.length < firstUserMessage.length
    ? `${truncated}...`
    : truncated;
};

export const resolvers = {
  Query: {
    health: () => "ElderTech API is running",

    conversation: async (_: unknown, { id }: { id: string }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      return conversation;
    },

    conversations: async (_: unknown, { userId }: { userId: string }) => {
      return prisma.conversation.findMany({
        where: { userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    chat: async (
      _: unknown,
      {
        messages,
        companionName,
        userId,
        conversationId,
      }: {
        messages: { role: string; content: string }[];
        companionName: string;
        userId: string;
        conversationId?: string;
      },
    ) => {
      // Get or create the conversation
      let conversation;
      if (conversationId) {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });
      }

      if (!conversation) {
        const firstUserMessage =
          messages.find((m) => m.role === "user")?.content ||
          "New conversation";
        conversation = await prisma.conversation.create({
          data: {
            userId,
            title: generateTitle(firstUserMessage),
          },
        });
      }

      // Save the latest user message
      const latestUserMessage = messages[messages.length - 1];
      if (latestUserMessage.role === "user") {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: latestUserMessage.role,
            content: latestUserMessage.content,
            flagged: false,
          },
        });
      }

      // Call Anthropic
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

      if (flagged) {
        console.warn(
          `[FLAG] userId=${userId} conversationId=${conversation.id} reason=${flagReason}`,
        );
      }

      const cleanReply = reply.replace(/\[SAFETY_FLAG\]/gi, "").trim();

      // Save the assistant reply
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "assistant",
          content: cleanReply,
          flagged,
        },
      });

      return {
        reply: cleanReply,
        flagged,
        flagReason,
        conversationId: conversation.id,
      };
    },

    summarise: async (
      _: unknown,
      { messages }: { messages: { role: string; content: string }[] },
    ) => {
      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        system:
          "You summarise conversations into a short, clear how-to guide for elderly users. Return only the summary — no preamble, no meta-commentary. Use plain English. Format as numbered steps. Max 100 words.",
        messages: [
          {
            role: "user",
            content: `Summarise this conversation into a brief how-to guide:\n\n${messages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}`,
          },
        ],
      });

      const summary =
        response.content[0].type === "text"
          ? response.content[0].text
          : "Steps saved from this conversation.";

      return { summary };
    },
  },
};
