"use client";

import { useState } from "react";
import { toast } from "sonner";

import { downloadTopic } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";

interface DownloadProgress {
  current: number;
  total: number;
}

export function useDownloadAll() {
  const { topics } = useTopicStore();
  const verifiedTopics = topics.filter((t) => t.status === "verified");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const downloadAll = async () => {
    if (verifiedTopics.length === 0) {
      toast.warning("No verified topics to download");
      return;
    }

    setIsDownloading(true);
    const total = verifiedTopics.length;
    let failed = 0;

    for (let i = 0; i < total; i++) {
      const topic = verifiedTopics[i];
      setProgress({ current: i + 1, total });
      const toastId = toast.loading(`Downloading ${i + 1} of ${total}: ${topic.name}…`);

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
    setProgress(null);

    if (failed === 0) {
      toast.success(`All ${total} PDF${total > 1 ? "s" : ""} downloaded successfully`);
    } else {
      toast.warning(`${total - failed} of ${total} downloads succeeded`);
    }
  };

  return {
    downloadAll,
    isDownloading,
    progress,
    canDownload: verifiedTopics.length > 0,
  };
}
