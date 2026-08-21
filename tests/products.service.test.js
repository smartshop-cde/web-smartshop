import test from "node:test";
import assert from "node:assert/strict";
import { createProductsService } from "../src/services/products.service.js";
import { productInputSchema } from "../src/validation/products.validation.js";

function createFakeService({ existingCodes = new Set(), products = [] } = {}) {
  const category = { id: "2c7ca8a2-83ed-4d36-bb5a-1e5e6a841235", name: "Celulares", slug: "celulares" };
  const productsRepository = {
    list: async () => ({ items: products, total: products.length, page: 1, limit: 50 }),
    findById: async (id) => products.find((product) => product.id === id) || null,
    findByPublicCode: async (publicCode) => products.find((product) => product.publicCode === publicCode) || null,
    publicCodeExists: async (publicCode) => existingCodes.has(publicCode),
    slugExists: async () => false,
    create: async (data) => {
      existingCodes.add(data.publicCode);
      const product = {
        id: "8cf79198-28b8-45e4-bcde-e333cb825d0d",
        createdAt: new Date(),
        updatedAt: new Date(),
        category,
        categoryId: category.id,
        ...data,
        variants: data.variants.create.map((variant, index) => ({
          id: `variant-${index}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...variant,
        })),
      };
      products.push(product);
      return product;
    },
    update: async () => null,
    softDelete: async () => null,
  };
  const categoriesRepository = {
    findById: async () => category,
    findOrCreateBySlug: async () => category,
  };
  return createProductsService({ productsRepository, categoriesRepository });
}

test("crea producto con codigo publico valido y variante default", async () => {
  const service = createFakeService();
  const product = await service.create({
    name: "AirPods Pro 2",
    category: "Audio",
    price: 1990000,
    stock: 5,
  });

  assert.match(product.publicCode, /^\d{5}$/);
  assert.equal(product.variants.length, 1);
  assert.equal(product.variants[0].name, "Default");
  assert.equal(product.price, 1990000);
  assert.equal(product.stock, 5);
});

test("conserva codigo publico valido cuando esta disponible", async () => {
  const service = createFakeService();
  const product = await service.create({
    publicCode: "58391",
    name: "iPhone 16 Pro",
    category: "Celulares",
    price: 100,
    stock: 1,
  });

  assert.equal(product.publicCode, "58391");
});

test("evita colision de codigo publico", async () => {
  const service = createFakeService({ existingCodes: new Set(["58391"]) });
  const product = await service.create({
    publicCode: "58391",
    name: "Producto con colision",
    category: "General",
    price: 100,
    stock: 1,
  });

  assert.match(product.publicCode, /^\d{5}$/);
  assert.notEqual(product.publicCode, "58391");
});

test("rechaza stock negativo desde validacion", () => {
  assert.throws(() =>
    productInputSchema.parse({
      name: "Producto invalido",
      category: "General",
      price: 100,
      stock: -1,
    })
  );
});

test("busca producto por codigo publico", async () => {
  const service = createFakeService();
  const created = await service.create({
    publicCode: "10482",
    name: "Producto buscable",
    category: "General",
    price: 100,
    stock: 1,
  });

  const found = await service.getByPublicCode("10482");
  assert.equal(found.id, created.id);
});

test("producto inexistente devuelve error de dominio", async () => {
  const service = createFakeService();
  await assert.rejects(() => service.getByPublicCode("99999"), /Producto no encontrado/);
});
