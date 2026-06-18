const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8404";

async function readApiError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string") return payload.detail;
    } catch {
      return `Request gagal dengan status ${response.status}.`;
    }
  }

  try {
    const text = await response.text();
    if (text.trim()) return text.trim();
  } catch {
    // ignore fallback
  }

  return `Request gagal dengan status ${response.status}.`;
}

export async function removeBackground(input: Blob, filename = "fourpix-input.png"): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", input, filename);

  const response = await fetch(`${API_BASE_URL}/process/remove-background`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return await response.blob();
}
