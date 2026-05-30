"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { verifyTopic } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";

function parseHashTopics(hash: string): string[] {
  const match = hash.match(/[#?]?q=([^&]*)/);
  if (!match || !match[1]) return [];
  return match[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildHash(names: string[]): string {
  return names.length > 0 ? `#q=${names.join(",")}` : "";
}

export function useQueueUrlSync() {
  const { topics, addTopic, updateTopic, removeTopic } = useTopicStore();
  const hasRestored = useRef(false);

  // Restore from hash once on mount
  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;

    const hashTopics = parseHashTopics(window.location.hash);
    if (hashTopics.length === 0) return;

    const currentNames = new Set(useTopicStore.getState().topics.map((t) => t.name));

    for (const name of hashTopics) {
      if (currentNames.has(name)) continue;

      const id = crypto.randomUUID();
      addTopic({ id, name, status: "verifying" });
      toast.loading(`Verifying "${name}"…`, { id });

      verifyTopic(name)
        .then((data) => {
          if (data.exists) {
            updateTopic(id, { status: "verified", url: data.url });
            toast.success(`"${name}" is available`, { id });
          } else {
            updateTopic(id, { status: "not-found" });
            toast.error(data.error ?? `"${name}" PDF not found`, { id });
            setTimeout(() => removeTopic(id), 5000);
          }
        })
        .catch(() => {
          updateTopic(id, { status: "not-found" });
          toast.error(`Failed to verify "${name}"`, { id });
          setTimeout(() => removeTopic(id), 5000);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const activeNames = topics
      .filter((t) => t.status !== "not-found")
      .map((t) => t.name);

    const newHash = buildHash(activeNames);
    if (window.location.hash !== newHash) {
      window.history.replaceState(
        null,
        "",
        newHash || window.location.pathname + window.location.search,
      );
    }
  }, [topics]);
}
