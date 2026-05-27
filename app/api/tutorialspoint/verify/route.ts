import type { NextRequest } from "next/server";

import { TUTORIALSPOINT_URL } from "@/lib/constants/site-config";
import { topicSchema } from "@/lib/schemas/topic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("topic");
  const parsed = topicSchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json(
      {
        exists: false,
        error: parsed.error.issues[0]?.message ?? "Invalid topic",
      },
      { status: 400 },
    );
  }

  const topic = parsed.data.toLowerCase();
  const pdfUrl = `${TUTORIALSPOINT_URL}/${topic}/${topic}_tutorial.pdf`;

  const upstreamHeaders = new Headers();
  const clientUserAgent = request.headers.get("user-agent");
  if (clientUserAgent) upstreamHeaders.set("User-Agent", clientUserAgent);

  try {
    const response = await fetch(pdfUrl, {
      method: "HEAD",
      headers: upstreamHeaders,
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const contentLength = response.headers.get("content-length");
    const exists = response.ok && contentType.toLowerCase().includes("pdf");

    return Response.json({
      exists,
      topic,
      url: pdfUrl,
      status: response.status,
      contentType,
      contentLength: contentLength ? Number(contentLength) : null,
    });
  } catch (error) {
    return Response.json(
      {
        exists: false,
        topic,
        url: pdfUrl,
        error:
          error instanceof Error ? error.message : "Upstream request failed",
      },
      { status: 502 },
    );
  }
}
