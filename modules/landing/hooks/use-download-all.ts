"use client";

import { useState } from "react";
import { toast } from "sonner";

import { downloadZip } from "../service/tutorialspoint";
import useTopicStore from "../store/topic-store";

export function useDownloadAll() {
  const { topics } = useTopicStore();
  const verifiedTopics = topics.filter((t) => t.status === "verified");
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAll = async () => {
    if (verifiedTopics.length === 0) {
      toast.warning("No verified topics to download");
      return;
    }

    setIsDownloading(true);
    const count = verifiedTopics.length;
    const toastId = toast.loading(
      `Building ZIP for ${count} PDF${count > 1 ? "s" : ""}…`,
    );

    try {
      const { failed } = await downloadZip(verifiedTopics.map((t) => t.name));
      const succeeded = count - failed.length;

      if (failed.length === 0) {
        toast.success(
          `Downloaded ZIP with ${count} PDF${count > 1 ? "s" : ""}`,
          { id: toastId },
        );
      } else {
        toast.warning(
          `ZIP downloaded — ${succeeded} of ${count} succeeded. Failed: ${failed.join(", ")}`,
          { id: toastId },
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "ZIP download failed",
        { id: toastId },
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadAll,
    isDownloading,
    canDownload: verifiedTopics.length > 0,
  };
}
