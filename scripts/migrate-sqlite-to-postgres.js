import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getPrisma, disconnectPrisma } from "../src/config/database.js";
import { createCatalogRepository } from "../src/repositories/catalog.repository.js";
import { createCatalogService } from "../src/services/catalog.service.js";

const root = process.cwd();
const sqlitePath = path.join(root, "data", "smartshop.sqlite3");
const backupPath = path.join(root, "backups", "smartshop-before-postgres.sqlite");

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function backupSqlite() {
  if (!fs.existsSync(sqlitePath)) return false;
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(sqlitePath, backupPath);
  return true;
}

function readSqliteCatalog() {
  if (!fs.existsSync(sqlitePath)) {
    throw new Error("No existe data/smartshop.sqlite3. Inicia el servidor legado una vez o usa npm run db:seed.");
  }

  const db = new DatabaseSync(sqlitePath, { readOnly: true });
  try {
    const storeRows = db.prepare("SELECT key, value FROM store_settings").all();
    const productRows = db.prepare("SELECT * FROM products ORDER BY sort_order, name").all();
    const sellerRows = db.prepare("SELECT * FROM sellers ORDER BY sort_order, name").all();

    return {
      store: Object.fromEntries(storeRows.map((row) => [row.key, parseJson(row.value, row.value)])),
      products: productRows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        category: row.category,
        sku: row.sku,
        price: Number(row.price || 0),
        stock: Number(row.stock || 0),
        featured: Boolean(row.featured),
        badge: row.badge || "",
        brand: row.brand || "",
        variant: row.variant || "",
        condition: row.condition || "",
        warranty: row.warranty || "",
        delivery: row.delivery || "",
        description: row.description || "",
        details: parseJson(row.details, []),
        image: row.image || "assets/logo-smartshop.png",
      })),
      sellers: sellerRows.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role || "",
        phone: row.phone || "",
        schedule: row.schedule || "",
        message: row.message || "",
        image: row.image || "assets/logo-smartshop.png",
      })),
    };
  } finally {
    db.close();
  }
}

const backupCreated = backupSqlite();
if (backupCreated) {
  console.log(`Backup SQLite creado en ${backupPath}`);
}

const catalog = readSqliteCatalog();
const prisma = getPrisma();
const catalogRepository = createCatalogRepository(prisma);
const catalogService = createCatalogService({ catalogRepository });

try {
  await catalogService.replaceCatalog(catalog);
  console.log(`Migracion completada: ${catalog.products.length} productos, ${catalog.sellers.length} vendedores.`);
  console.log("SQLite no fue eliminado; se conserva como respaldo.");
} finally {
  await disconnectPrisma();
}
