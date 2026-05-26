import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL
  ? `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes("?") ? "&" : "?"}uselibpqcompat=true&sslmode=require`
  : undefined;

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

const isPrismaClientStale = (client: PrismaClient) => {
  const delegate = (client as PrismaClient & { credential?: { findMany?: unknown } })
    .credential;
  return typeof delegate?.findMany !== "function";
};

const prisma =
  globalForPrisma.prisma && !isPrismaClientStale(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
