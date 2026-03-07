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
    conversationId: string;
  };
}

const USER_ID = "user-001";

const welcomeMessage = (name: string): Message => ({
  role: "assistant",
  content: `Hello, lovely to see you. I'm ${name}, and I'm here whenever you need a hand with anything on your computer.\n\nToday we can work on your emails together — reading them, sending one, or anything else you'd like. There's no rush at all.\n\nWhat would you like to do?`,
});

export function useChat(companionName: string) {
  const [messages, setMessages] = useState<Message[]>([
    welcomeMessage(companionName),
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [mutate, { loading }] = useMutation<ChatResponse>(CHAT_MUTATION);

  const resetMessages = (name: string) => {
    setMessages([welcomeMessage(name)]);
    setConversationId(null);
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const { data } = await mutate({
        variables: {
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          companionName,
          userId: USER_ID,
          conversationId,
        },
      });

      if (!data) return;

      const { reply, flagged, conversationId: returnedId } = data.chat;

      if (returnedId && !conversationId) {
        setConversationId(returnedId);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, flagged },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a little trouble connecting right now. Please try again in a moment.",
          flagged: false,
        },
      ]);
    }
  };

  return {
    messages,
    sendMessage,
    loading,
    resetMessages,
    addMessage,
    conversationId,
  };
}
