"use client";

import { toast } from "sonner";

import { verifyTopic } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";

export function useRetryTopic() {
  const { updateTopic } = useTopicStore();

  const retry = async (id: string, name: string) => {
    updateTopic(id, { status: "verifying", url: undefined });
    toast.loading(`Re-verifying "${name}"…`, { id });

    try {
      const data = await verifyTopic(name);
      if (data.exists) {
        updateTopic(id, { status: "verified", url: data.url });
        toast.success(`"${name}" is available`, { id });
      } else {
        updateTopic(id, { status: "not-found" });
        toast.error(data.error ?? `"${name}" PDF not found`, { id });
      }
    } catch {
      updateTopic(id, { status: "not-found" });
      toast.error(`Failed to verify "${name}"`, { id });
    }
  };

  return { retry };
}
