export class WebhookBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookBodyError";
  }
}

/**
 * Reads the request body as text first so empty or partial payloads from
 * clients (e.g. PowerShell curl) don't break request.json().
 */
export const parseWebhookRequestBody = async (
  request: Request,
): Promise<unknown> => {
  const contentType = request.headers.get("content-type") ?? "";
  const raw = await request.text();
  const trimmed = raw.replace(/^\uFEFF/, "").trim();

  if (!trimmed) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      throw new WebhookBodyError("Invalid JSON body");
    }
  }

  return { raw: trimmed };
};
