import { z } from "zod";

export const topicSchema = z
  .string()
  .trim()
  .min(1, "Topic is required")
  .max(64, "Topic is too long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Topic may only contain letters, numbers, hyphens, and underscores",
  );
