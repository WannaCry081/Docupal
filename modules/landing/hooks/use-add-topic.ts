"use client";

import { toast } from "sonner";

import { verifyTopic } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";

export function useAddTopic() {
  const { topics, addTopic, updateTopic, removeTopic } = useTopicStore();

  const addAndVerify = async (name: string) => {
    const topic = name.trim().toLowerCase();

    if (!topic) {
      toast.error("Please enter a topic name");
      return;
    }

    if (topics.some((t) => t.name === topic)) {
      toast.warning(`"${topic}" is already in your queue`);
      return;
    }

    const id = crypto.randomUUID();
    addTopic({ id, name: topic, status: "verifying" });
    toast.loading(`Verifying "${topic}"…`, { id });

    try {
      const data = await verifyTopic(topic);

      if (data.exists) {
        updateTopic(id, { status: "verified", url: data.url });
        toast.success(`"${topic}" is available`, { id });
      } else {
        updateTopic(id, { status: "not-found" });
        toast.error(data.error ?? `"${topic}" PDF not found`, { id });
        setTimeout(() => removeTopic(id), 5000);
      }
    } catch {
      updateTopic(id, { status: "not-found" });
      toast.error(`Failed to verify "${topic}"`, { id });
      setTimeout(() => removeTopic(id), 5000);
    }
  };

  return { addAndVerify };
}
