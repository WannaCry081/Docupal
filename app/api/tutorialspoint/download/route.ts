import type { NextRequest } from "next/server";

import { TUTORIALSPOINT_URL } from "@/lib/constants/site-config";
import { topicSchema } from "@/lib/schemas/topic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("topic");
  const parsed = topicSchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid topic" },
      { status: 400 },
    );
  }

  const topic = parsed.data.toLowerCase();
  const pdfUrl = `${TUTORIALSPOINT_URL}/${topic}/${topic}_tutorial.pdf`;

  const upstreamHeaders = new Headers();
  const clientUserAgent = request.headers.get("user-agent");
  if (clientUserAgent) upstreamHeaders.set("User-Agent", clientUserAgent);

  let upstream: Response;
  try {
    upstream = await fetch(pdfUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Upstream request failed",
      },
      { status: 502 },
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";

  if (!upstream.ok || !contentType.toLowerCase().includes("pdf")) {
    return Response.json(
      { error: "PDF not found", topic, status: upstream.status },
      { status: upstream.status === 404 ? 404 : 502 },
    );
  }

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${topic}.pdf"`,
    "Cache-Control": "no-store",
  });

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(upstream.body, { status: 200, headers });
}
