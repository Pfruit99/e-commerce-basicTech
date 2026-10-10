import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/** Cliente de Prisma compartido. Solo para código de servidor: no importarlo desde componentes de cliente. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Falta DATABASE_URL. Copia .env.example a .env.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const db = globalForPrisma.prisma ?? createClient();

// En desarrollo, el hot reload recrearía el cliente (y sus conexiones) en cada cambio.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
