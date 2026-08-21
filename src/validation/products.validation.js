import { z } from "zod";
import { isValidPublicCode } from "../utils/product-code.js";

const uuidSchema = z.string().uuid();
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .default("")
  .refine(
    (value) => !value || value.startsWith("assets/") || value.startsWith("/assets/") || /^https?:\/\//.test(value),
    "La imagen debe ser una URL http(s) o una ruta assets/."
  );

export const productListQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const productIdParamSchema = z.object({
  id: uuidSchema,
});

export const publicCodeParamSchema = z.object({
  publicCode: z.string().refine(isValidPublicCode, "El codigo publico debe tener 5 digitos."),
});

export const variantInputSchema = z.object({
  id: uuidSchema.optional(),
  sku: z.string().trim().optional().nullable(),
  name: z.string().trim().min(1).default("Default"),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  active: z.boolean().optional().default(true),
});

export const productInputSchema = z.object({
  publicCode: z.string().refine(isValidPublicCode).optional(),
  code: z.string().refine(isValidPublicCode).optional(),
  legacyId: z.string().trim().optional(),
  id: z.string().trim().optional(),
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().default(""),
  details: z.array(z.string().trim()).optional().default([]),
  brand: z.string().trim().optional().default(""),
  badge: z.string().trim().optional().default(""),
  condition: z.string().trim().optional().default("Nuevo"),
  warranty: z.string().trim().optional().default("Garantia de tienda"),
  delivery: z.string().trim().optional().default("Retiro en tienda o envio coordinado"),
  image: optionalUrl,
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  categoryId: uuidSchema.optional(),
  category: z.string().trim().optional().default("General"),
  variant: z.string().trim().optional().default("Default"),
  sku: z.string().trim().optional().nullable(),
  price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  variants: z.array(variantInputSchema).optional(),
});

export const productUpdateSchema = productInputSchema.partial().extend({
  variants: z.array(variantInputSchema).optional(),
});
