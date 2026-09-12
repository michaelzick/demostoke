export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function errorResponse(
  error: unknown,
  corsHeaders: Record<string, string>,
): Response {
  const known = error instanceof HttpError;
  if (!known) {
    console.error("Request failed", {
      errorType: error instanceof Error ? error.name : "Unknown",
    });
  }
  return new Response(
    JSON.stringify({
      success: false,
      error: known
        ? error.message
        : "Unable to complete request. Please try again.",
    }),
    {
      status: known ? error.status : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

export async function readJson(
  req: Request,
  maxBytes = 64 * 1024,
): Promise<unknown> {
  if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
  if (Number(req.headers.get("content-length")) > maxBytes) {
    throw new HttpError(413, "Request is too large");
  }
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "A JSON body is required");
  let size = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new HttpError(413, "Request is too large");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}
