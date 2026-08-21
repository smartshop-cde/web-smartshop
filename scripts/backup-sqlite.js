import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "data", "smartshop.sqlite3");
const backupsDir = path.join(root, "backups");
const target = path.join(backupsDir, "smartshop-before-postgres.sqlite");

if (!fs.existsSync(source)) {
  console.log("No existe data/smartshop.sqlite3; no hay backup que crear.");
  process.exit(0);
}

fs.mkdirSync(backupsDir, { recursive: true });
fs.copyFileSync(source, target);
console.log(`Backup creado en ${target}`);
