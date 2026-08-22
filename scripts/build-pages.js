import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const distDir = path.join(rootDir, "dist");

fs.rmSync(distDir, { recursive: true, force: true });
copyDirectory(publicDir, distDir);
createAdminRoute();
writeSupabaseEnv();

console.log("Cloudflare Workers Static Assets build listo en dist/");

function copyDirectory(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function writeSupabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.SMARTSHOP_SUPABASE_URL || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SMARTSHOP_SUPABASE_ANON_KEY || "";
  const content = `(function () {
  window.SMARTSHOP_SUPABASE_URL = ${JSON.stringify(url)};
  window.SMARTSHOP_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};
})();\n`;
  fs.writeFileSync(path.join(distDir, "assets", "supabase-env.js"), content);
}

function createAdminRoute() {
  const adminDir = path.join(distDir, "admin");
  fs.mkdirSync(adminDir, { recursive: true });
  fs.copyFileSync(path.join(distDir, "admin.html"), path.join(adminDir, "index.html"));
}
