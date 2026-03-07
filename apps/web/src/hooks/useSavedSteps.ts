import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { SUMMARISE_MUTATION } from "../graphql/mutations";

const STEPS_KEY = "eldertech_saved_steps";

export interface SavedStep {
  id: string;
  title: string;
  summary: string;
  conversationId: string;
  createdAt: string;
}

interface SummaryResponse {
  summarise: { summary: string };
}

export function useSavedSteps() {
  const [steps, setSteps] = useState<SavedStep[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STEPS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [mutate] = useMutation<SummaryResponse>(SUMMARISE_MUTATION);

  const saveStep = async (
    title: string,
    messages: { role: string; content: string }[],
    conversationId: string,
  ): Promise<SavedStep> => {
    const { data } = await mutate({ variables: { messages } });
    const summary =
      data?.summarise.summary || "Steps saved from this conversation.";

    const step: SavedStep = {
      id: crypto.randomUUID(),
      title,
      summary,
      conversationId,
      createdAt: new Date().toISOString(),
    };

    const updated = [step, ...steps];
    setSteps(updated);
    localStorage.setItem(STEPS_KEY, JSON.stringify(updated));
    return step;
  };

  const deleteStep = (id: string) => {
    const updated = steps.filter((s) => s.id !== id);
    setSteps(updated);
    localStorage.setItem(STEPS_KEY, JSON.stringify(updated));
  };

  return { steps, saveStep, deleteStep };
}
