import { Router } from "express";
import { getPrisma } from "../config/database.js";
import { createAdminAuth } from "../middleware/admin-auth.js";
import { createProductsRepository } from "../repositories/products.repository.js";
import { createCategoriesRepository } from "../repositories/categories.repository.js";
import { createCatalogRepository } from "../repositories/catalog.repository.js";
import { createProductsService } from "../services/products.service.js";
import { createCategoriesService } from "../services/categories.service.js";
import { createCatalogService } from "../services/catalog.service.js";
import { createExcelService } from "../services/excel.service.js";
import { createProductsController } from "../controllers/products.controller.js";
import { createCategoriesController } from "../controllers/categories.controller.js";
import { createCatalogController } from "../controllers/catalog.controller.js";
import { createHealthController } from "../controllers/health.controller.js";
import { createProductsRouter } from "./products.routes.js";
import { createCategoriesRouter } from "./categories.routes.js";
import { createCatalogRouter } from "./catalog.routes.js";
import { createHealthRouter } from "./health.routes.js";

export function createApiRouter(dependencies = {}) {
  const prisma = dependencies.prisma || getPrisma();
  const productsRepository = dependencies.productsRepository || createProductsRepository(prisma);
  const categoriesRepository = dependencies.categoriesRepository || createCategoriesRepository(prisma);
  const catalogRepository = dependencies.catalogRepository || createCatalogRepository(prisma);

  const productsService =
    dependencies.productsService || createProductsService({ productsRepository, categoriesRepository });
  const categoriesService =
    dependencies.categoriesService || createCategoriesService({ categoriesRepository });
  const catalogService = dependencies.catalogService || createCatalogService({ catalogRepository });
  const excelService = dependencies.excelService || createExcelService({ catalogService });

  const adminAuth = dependencies.adminAuth || createAdminAuth(catalogService);
  const productsController = createProductsController({ productsService });
  const categoriesController = createCategoriesController({ categoriesService });
  const catalogController = createCatalogController({ catalogService, excelService });
  const healthController = createHealthController({ prisma });

  const router = Router();
  router.use(createHealthRouter({ healthController }));
  router.use(createCatalogRouter({ catalogController, adminAuth }));
  router.use("/products", createProductsRouter({ productsController, adminAuth }));
  router.use("/categories", createCategoriesRouter({ categoriesController }));

  return router;
}
