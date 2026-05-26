import { randomBytes } from "node:crypto";

export const generateWebhookSecret = () =>
  `whsec_${randomBytes(24).toString("base64url")}`;
