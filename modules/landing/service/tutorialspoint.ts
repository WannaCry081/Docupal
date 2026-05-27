type VerifyResponse =
  | { exists: true; url: string }
  | { exists: false; error?: string };

export async function verifyTopic(name: string): Promise<VerifyResponse> {
  const res = await fetch(
    `/api/tutorialspoint/verify?topic=${encodeURIComponent(name)}`,
  );
  return res.json();
}

export function downloadTopic(name: string): void {
  const anchor = document.createElement("a");
  anchor.href = `/api/tutorialspoint/download?topic=${encodeURIComponent(name)}`;
  anchor.download = `${name}.pdf`;
  anchor.click();
}
