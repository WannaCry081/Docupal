"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";

import { SUGGESTED_TOPIC_CONTENT } from "../constants/suggested-topic-content";
import { verifyTopic } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";

export const TopicSelector = () => {
  const [input, setInput] = useState("");
  const { topics, addTopic, updateTopic, removeTopic } = useTopicStore();

  const handleAddAndVerify = async () => {
    const name = input.trim().toLowerCase();

    if (!name) {
      toast.error("Please enter a topic name");
      return;
    }

    if (topics.some((t) => t.name === name)) {
      toast.warning(`"${name}" is already in your queue`);
      return;
    }

    const id = crypto.randomUUID();
    addTopic({ id, name, status: "verifying" });
    setInput("");
    toast.loading(`Verifying "${name}"…`, { id });

    try {
      const data = await verifyTopic(name);

      if (data.exists) {
        updateTopic(id, { status: "verified", url: data.url });
        toast.success(`"${name}" is available`, { id });
      } else {
        updateTopic(id, { status: "not-found" });
        toast.error(data.error ?? `"${name}" PDF not found`, { id });
        setTimeout(() => removeTopic(id), 5000);
      }
    } catch {
      updateTopic(id, { status: "not-found" });
      toast.error(`Failed to verify "${name}"`, { id });
      setTimeout(() => removeTopic(id), 5000);
    }
  };

  return (
    <section className="px-5 sm:px-10 pb-24">
      <div className="w-full sm:max-w-xl mx-auto">
        <InputGroup className="bg-white dark:bg-muted shadow-xs px-2 h-12 rounded-full">
          <InputGroupInput
            placeholder="Tutorialspoint topic"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddAndVerify();
              if (e.key === "Escape") setInput("");
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="default"
              className="p-4 rounded-full text-xs"
              onClick={handleAddAndVerify}
            >
              Add & Verify
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex flex-wrap justify-center gap-1.5 mt-4">
          {SUGGESTED_TOPIC_CONTENT.map(({ id, title, body }) => (
            <button
              key={id}
              onClick={() => setInput(body ?? title.toLowerCase())}
            >
              <Badge variant="secondary">{title}</Badge>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
