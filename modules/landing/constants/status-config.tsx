import type { ReactNode } from "react";

import { CheckCircleIcon, LoaderIcon, XCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { type TopicStatus } from "../store/topic-store";

export const STATUS_CONFIG: Record<TopicStatus, ReactNode> = {
  verifying: (
    <Badge variant="secondary" className="shrink-0 gap-1">
      <LoaderIcon className="animate-spin" />
      <span className="hidden sm:inline">Verifying</span>
    </Badge>
  ),
  verified: (
    <Badge
      variant="secondary"
      className="shrink-0 gap-1 bg-primary/10 text-primary hover:bg-primary/15"
    >
      <CheckCircleIcon />
      <span className="hidden sm:inline">Available</span>
    </Badge>
  ),
  "not-found": (
    <Badge
      variant="secondary"
      className="shrink-0 gap-1 bg-destructive/10 text-destructive hover:bg-destructive/15"
    >
      <XCircleIcon />
      <span className="hidden sm:inline">Not Found</span>
    </Badge>
  ),
};
