import pino from "pino";
import { isProduction, isTest } from "./env.js";

export const logger = pino({
  enabled: !isTest,
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    'req.headers["x-admin-pin"]',
    'req.headers["x-api-key"]',
    "pin",
    "*.pin",
    "*.password",
    "*.token",
  ],
});
