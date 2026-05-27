"use client";

import { toast } from "sonner";
import { DownloadIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { STATUS_CONFIG } from "../constants/status-config";
import { downloadTopic } from "../service/tutorialspoint";
import { type Topic } from "../store/topic-store";
import useTopicStore from "../store/topic-store";

interface QueueItemProps {
  sequence: number;
  topic: Topic;
}

export const QueueItem = ({ sequence, topic }: QueueItemProps) => {
  const { removeTopic } = useTopicStore();

  const handleDownload = () => {
    downloadTopic(topic.name);
    toast.success(`Downloading "${topic.name}.pdf"`);
  };

  const handleRemove = () => {
    removeTopic(topic.id);
    toast.success(`"${topic.name}" removed`);
  };

  return (
    <div className="flex items-center p-4 bg-white mb-2 rounded-xs dark:bg-muted">
      <div className="flex-1 text-sm truncate inline-flex items-center gap-2 sm:gap-4">
        <div className="font-mono text-xs text-muted-foreground">
          {sequence}
        </div>
        <div>{topic.name}.pdf</div>
      </div>

      {STATUS_CONFIG[topic.status]}

      <TooltipProvider>
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={topic.status !== "verified"}
                onClick={handleDownload}
                className="size-9 p-0"
                aria-label={`Download ${topic.name}`}
              >
                <DownloadIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="size-9 p-0 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
                aria-label={`Remove ${topic.name}`}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
