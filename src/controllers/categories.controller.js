import { ok } from "../utils/http.js";

export function createCategoriesController({ categoriesService }) {
  return {
    async list(req, res) {
      return ok(res, await categoriesService.list());
    },
  };
}
