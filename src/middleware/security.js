import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export function applySecurity(app) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) : true,
      credentials: false,
    })
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000,
      limit: 240,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
}
