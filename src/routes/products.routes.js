import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";

export function createProductsRouter({ productsController, adminAuth }) {
  const router = Router();

  router.get("/", asyncHandler(productsController.list));
  router.get("/code/:publicCode", asyncHandler(productsController.getByPublicCode));
  router.get("/:id", asyncHandler(productsController.getById));
  router.post("/", adminAuth, asyncHandler(productsController.create));
  router.put("/:id", adminAuth, asyncHandler(productsController.update));
  router.delete("/:id", adminAuth, asyncHandler(productsController.remove));

  return router;
}
