import express from "express";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applySecurity } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { logger } from "./config/logger.js";
import { createApiRouter } from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "public");

export function createApp(dependencies = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(pinoHttp({ logger }));
  applySecurity(app);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.raw({ type: "application/octet-stream", limit: "8mb" }));
  app.use(express.static(publicDir, { extensions: ["html"] }));

  app.use("/api", createApiRouter(dependencies));

  app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
