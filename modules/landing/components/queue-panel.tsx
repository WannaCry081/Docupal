"use client";

import { useState } from "react";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { downloadTopic } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";
import { QueueItem } from "./queue-item";

export const QueuePanel = () => {
  const { topics, clearTopics } = useTopicStore();
  const verifiedTopics = topics.filter((t) => t.status === "verified");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClear = () => {
    clearTopics();
    toast.success("Queue cleared");
  };

  const handleDownloadAll = async () => {
    if (verifiedTopics.length === 0) {
      toast.warning("No verified topics to download");
      return;
    }

    setIsDownloading(true);
    const total = verifiedTopics.length;
    let failed = 0;

    for (let i = 0; i < total; i++) {
      const topic = verifiedTopics[i];
      const toastId = toast.loading(
        `Downloading ${i + 1} of ${total}: ${topic.name}…`,
      );
      try {
        await downloadTopic(topic.name);
        toast.success(`Downloaded: ${topic.name}`, { id: toastId });
      } catch (err) {
        failed++;
        toast.error(
          `Failed: ${topic.name} — ${err instanceof Error ? err.message : "Unknown error"}`,
          { id: toastId },
        );
      }
    }

    setIsDownloading(false);

    if (failed === 0) {
      toast.success(
        `All ${total} PDF${total > 1 ? "s" : ""} downloaded successfully`,
      );
    } else {
      toast.warning(`${total - failed} of ${total} downloads succeeded`);
    }
  };

  return (
    <section className="px-5 sm:px-10 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="inline-flex gap-2">
          <h2 className="text-lg font-medium">Queue</h2>
          <Badge className="self-center">
            {topics.length} {topics.length === 1 ? "Item" : "Items"}
          </Badge>
        </div>
        <div className="inline-flex gap-2">
          <Button
            variant="outline"
            className="px-4"
            size="sm"
            onClick={handleClear}
            disabled={topics.length === 0}
          >
            <TrashIcon className="size-3.5" />
            <span className="hidden sm:block">Clear</span>
          </Button>
          <Button
            variant="secondary"
            className="px-4"
            size="sm"
            onClick={handleDownloadAll}
            disabled={verifiedTopics.length === 0 || isDownloading}
          >
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:block">Download All</span>
          </Button>
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="min-h-36 w-full flex items-center justify-center bg-white dark:bg-muted rounded-xs shadow-xs border border-input border-dashed text-sm text-muted-foreground">
          No items yet. Add a topic above.
        </div>
      ) : (
        <div className="overflow-hidden">
          {topics.map((topic, index) => (
            <QueueItem key={topic.id} sequence={index + 1} topic={topic} />
          ))}
        </div>
      )}
    </section>
  );
};
