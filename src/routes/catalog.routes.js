import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";

export function createCatalogRouter({ catalogController, adminAuth }) {
  const router = Router();

  router.get("/catalog", asyncHandler(catalogController.getCatalog));
  router.put("/catalog", adminAuth, asyncHandler(catalogController.replaceCatalog));
  router.post("/login", asyncHandler(catalogController.login));
  router.get("/products/export-excel", adminAuth, asyncHandler(catalogController.exportExcel));
  router.post("/products/import-excel", adminAuth, asyncHandler(catalogController.importExcel));

  return router;
}
