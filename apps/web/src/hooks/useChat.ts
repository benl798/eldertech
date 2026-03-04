import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CHAT_MUTATION } from "../graphql/mutations";

export interface Message {
  role: "user" | "assistant";
  content: string;
  flagged?: boolean;
}

interface ChatResponse {
  chat: {
    reply: string;
    flagged: boolean;
    flagReason: string | null;
  };
}

const COMPANION_NAME =
  localStorage.getItem("eldertech_companion_name") || "Your Companion";
const USER_ID = "user-001";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello, lovely to see you. I'm ${COMPANION_NAME}, and I'm here whenever you need a hand with anything on your computer.\n\nToday we can work on your emails together — reading them, sending one, or anything else you'd like. There's no rush at all.\n\nWhat would you like to do?`,
    },
  ]);

  const [mutate, { loading }] = useMutation<ChatResponse>(CHAT_MUTATION);

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const { data } = await mutate({
      variables: {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        companionName: COMPANION_NAME,
        userId: USER_ID,
      },
    });

    if (!data) return;

    const { reply, flagged } = data.chat;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: reply, flagged },
    ]);
  };

  return { messages, sendMessage, loading };
}
