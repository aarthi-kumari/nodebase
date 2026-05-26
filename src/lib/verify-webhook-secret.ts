import { timingSafeEqual } from "node:crypto";

export const verifyWebhookSecret = (
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean => {
  if (!provided || !expected) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};
