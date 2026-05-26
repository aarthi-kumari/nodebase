import type { Prisma } from "@/generated/prisma";

export const toPrismaJson = <T>(value: T): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
