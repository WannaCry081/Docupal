import type { NextRequest } from "next/server";
import JSZip from "jszip";

import { TUTORIALSPOINT_URL } from "@/lib/constants/site-config";
import { topicSchema } from "@/lib/schemas/topic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("topics");
  if (!raw?.trim()) {
    return Response.json({ error: "No topics provided" }, { status: 400 });
  }

  const validTopics: string[] = [];
  for (const name of raw.split(",").map((t) => t.trim()).filter(Boolean)) {
    const parsed = topicSchema.safeParse(name);
    if (parsed.success) validTopics.push(parsed.data.toLowerCase());
  }

  if (validTopics.length === 0) {
    return Response.json({ error: "No valid topic names" }, { status: 400 });
  }

  const zip = new JSZip();
  const failed: string[] = [];

  await Promise.all(
    validTopics.map(async (topic) => {
      const pdfUrl = `${TUTORIALSPOINT_URL}/${topic}/${topic}_tutorial.pdf`;
      try {
        const res = await fetch(pdfUrl, { redirect: "follow" });
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || !contentType.toLowerCase().includes("pdf")) {
          failed.push(topic);
          return;
        }
        zip.file(`${topic}.pdf`, await res.arrayBuffer());
      } catch {
        failed.push(topic);
      }
    }),
  );

  if (Object.keys(zip.files).length === 0) {
    return Response.json(
      { error: "Could not fetch any PDFs", failed },
      { status: 502 },
    );
  }

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

  const headers = new Headers({
    "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="tutorials.zip"',
    "Cache-Control": "no-store",
  });

  if (failed.length > 0) {
    headers.set("X-Failed-Topics", failed.join(","));
  }

  return new Response(zipBuffer, { status: 200, headers });
}
