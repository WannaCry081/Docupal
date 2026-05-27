"use client";

import { DownloadIcon, Share2Icon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useDownloadAll } from "../hooks/use-download-all";
import useTopicStore from "../store/topic-store";
import { QueueItem } from "./queue-item";

export const QueuePanel = () => {
  const { topics, clearTopics } = useTopicStore();
  const { downloadAll, isDownloading, progress, canDownload } = useDownloadAll();

  const handleClear = () => {
    clearTopics();
    toast.success("Queue cleared");
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard");
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
            onClick={handleShare}
            disabled={topics.filter((t) => t.status !== "not-found").length === 0}
          >
            <Share2Icon className="size-3.5" />
            <span className="hidden sm:block">Share</span>
          </Button>
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
            onClick={downloadAll}
            disabled={!canDownload || isDownloading}
          >
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:block">
              {progress ? `${progress.current}/${progress.total}` : "Download All"}
            </span>
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
