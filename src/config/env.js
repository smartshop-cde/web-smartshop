import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

    if (!match || match[1].startsWith("#") || process.env[match[1]] !== undefined) {
      continue;
    }

    const value = (match[2] ?? "").replace(/^["']|["']$/g, "");
    process.env[match[1]] = value;
  }
}

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
