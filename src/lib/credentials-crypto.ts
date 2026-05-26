import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT = "nodebase-credentials";

const getEncryptionKey = () => {
  const secret =
    process.env.CREDENTIALS_ENCRYPTION_KEY ??
    process.env.BETTER_AUTH_SECRET ??
    "nodebase-dev-credentials-key";

  return scryptSync(secret, SALT, 32);
};

export const encryptCredentialValue = (plainText: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decryptCredentialValue = (encoded: string): string => {
  const buffer = Buffer.from(encoded, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
};

export const getCredentialLastFour = (value: string) =>
  value.length <= 4 ? value : value.slice(-4);
