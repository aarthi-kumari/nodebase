import "server-only";

import prisma from "@/lib/db";
import { decryptCredentialValue } from "@/lib/credentials-crypto";

export const getCredentialValue = async (
  userId: string,
  credentialId: string,
): Promise<string> => {
  const credential = await prisma.credential.findFirst({
    where: { id: credentialId, userId },
  });

  if (!credential) {
    throw new Error("Credential not found.");
  }

  return decryptCredentialValue(credential.value);
};
