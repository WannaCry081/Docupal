type VerifyResponse =
  | { exists: true; url: string }
  | { exists: false; error?: string };

export async function verifyTopic(name: string): Promise<VerifyResponse> {
  const res = await fetch(
    `/api/tutorialspoint/verify?topic=${encodeURIComponent(name)}`,
  );
  return res.json();
}

export async function downloadTopic(name: string): Promise<void> {
  const res = await fetch(
    `/api/tutorialspoint/download?topic=${encodeURIComponent(name)}`,
  );

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadZip(names: string[]): Promise<{ failed: string[] }> {
  const topics = names.map(encodeURIComponent).join(",");
  const res = await fetch(`/api/tutorialspoint/zip?topics=${topics}`);

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `ZIP download failed (${res.status})`);
  }

  const failed = (res.headers.get("X-Failed-Topics") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "tutorials.zip";
  anchor.click();
  URL.revokeObjectURL(url);

  return { failed };
}
