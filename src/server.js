import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { getPrisma, disconnectPrisma } from "./config/database.js";
import { logger } from "./config/logger.js";

const prisma = getPrisma();
const app = createApp({ prisma });

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `SmartShop API disponible en http://127.0.0.1:${env.PORT}`);
});

async function shutdown(signal) {
  logger.info({ signal }, "Cerrando servidor");
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
