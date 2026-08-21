import { PrismaClient } from "@prisma/client";
import { env, isTest } from "./env.js";
import { logger } from "./logger.js";

let prisma;

export function getPrisma() {
  if (!env.DATABASE_URL && !isTest) {
    throw new Error("DATABASE_URL no esta configurada.");
  }
  if (!prisma) {
    prisma = new PrismaClient({
      log: isTest ? [] : ["warn", "error"],
    });
  }
  return prisma;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
    logger.debug("Prisma desconectado");
  }
}
