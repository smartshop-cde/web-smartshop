import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

test("GET /api/health responde estado ok", async () => {
  const app = createApp({
    prisma: {
      $queryRaw: async () => [{ "?column?": 1 }],
    },
    productsService: {},
    categoriesService: { list: async () => [] },
    catalogService: { verifyPin: async () => true, getCatalog: async () => ({ store: {}, products: [], sellers: [] }) },
    excelService: {},
    adminAuth: (req, res, next) => next(),
  });

  const response = await request(app).get("/api/health").expect(200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, "ok");
  assert.equal(response.body.data.database, "connected");
});

test("POST /api/products valida y crea producto", async () => {
  const app = createApp({
    prisma: { $queryRaw: async () => [] },
    productsService: {
      create: async (input) => ({
        id: "8cf79198-28b8-45e4-bcde-e333cb825d0d",
        publicCode: "58391",
        code: "58391",
        name: input.name,
        variants: [{ name: "Default", price: input.price, stock: input.stock }],
      }),
    },
    categoriesService: { list: async () => [] },
    catalogService: { verifyPin: async () => true, getCatalog: async () => ({ store: {}, products: [], sellers: [] }) },
    excelService: {},
    adminAuth: (req, res, next) => next(),
  });

  const response = await request(app)
    .post("/api/products")
    .send({ name: "Producto API", category: "General", price: 1000, stock: 2 })
    .expect(201);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.code, "58391");
});
