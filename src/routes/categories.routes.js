import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";

export function createCategoriesRouter({ categoriesController }) {
  const router = Router();
  router.get("/", asyncHandler(categoriesController.list));
  return router;
}
