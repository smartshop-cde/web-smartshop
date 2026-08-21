import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  PORT: z.coerce.number().int().positive().default(8000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ADMIN_PIN: z.string().min(4).default("2026"),
  CORS_ORIGIN: z.string().optional().default(""),
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
