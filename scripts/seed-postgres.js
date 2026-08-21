import fs from "node:fs";
import path from "node:path";
import { getPrisma, disconnectPrisma } from "../src/config/database.js";
import { createCatalogRepository } from "../src/repositories/catalog.repository.js";
import { createCatalogService } from "../src/services/catalog.service.js";

const seedPath = path.join(process.cwd(), "data", "seed.json");
const catalog = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const prisma = getPrisma();
const catalogRepository = createCatalogRepository(prisma);
const catalogService = createCatalogService({ catalogRepository });

try {
  await catalogService.replaceCatalog(catalog);
  console.log("Seed de PostgreSQL aplicado correctamente.");
} finally {
  await disconnectPrisma();
}
