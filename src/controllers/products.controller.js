import {
  productIdParamSchema,
  productInputSchema,
  productListQuerySchema,
  productUpdateSchema,
  publicCodeParamSchema,
} from "../validation/products.validation.js";
import { created, ok } from "../utils/http.js";

export function createProductsController({ productsService }) {
  return {
    async list(req, res) {
      const query = productListQuerySchema.parse(req.query);
      const result = await productsService.list(query);
      return ok(res, result.products, result.meta);
    },

    async getById(req, res) {
      const { id } = productIdParamSchema.parse(req.params);
      return ok(res, await productsService.getById(id));
    },

    async getByPublicCode(req, res) {
      const { publicCode } = publicCodeParamSchema.parse(req.params);
      return ok(res, await productsService.getByPublicCode(publicCode));
    },

    async create(req, res) {
      const input = productInputSchema.parse(req.body);
      return created(res, await productsService.create(input));
    },

    async update(req, res) {
      const { id } = productIdParamSchema.parse(req.params);
      const input = productUpdateSchema.parse(req.body);
      return ok(res, await productsService.update(id, input));
    },

    async remove(req, res) {
      const { id } = productIdParamSchema.parse(req.params);
      return ok(res, await productsService.remove(id));
    },
  };
}
