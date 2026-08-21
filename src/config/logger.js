import pino from "pino";
import { isProduction, isTest } from "./env.js";

export const logger = pino({
  enabled: !isTest,
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  redact: ["req.headers.authorization", "req.headers.cookie", "pin", "*.pin", "*.password", "*.token"],
});
