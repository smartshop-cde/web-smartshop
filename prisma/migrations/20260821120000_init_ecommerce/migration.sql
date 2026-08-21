CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "store_settings" (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "sellers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "legacy_id" TEXT UNIQUE,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "schedule" TEXT NOT NULL DEFAULT '',
  "message" TEXT NOT NULL DEFAULT '',
  "image" TEXT NOT NULL DEFAULT '',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "public_code" VARCHAR(5) NOT NULL UNIQUE,
  "legacy_id" TEXT UNIQUE,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "details" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "brand" TEXT NOT NULL DEFAULT '',
  "badge" TEXT NOT NULL DEFAULT '',
  "condition" TEXT NOT NULL DEFAULT '',
  "warranty" TEXT NOT NULL DEFAULT '',
  "delivery" TEXT NOT NULL DEFAULT '',
  "image" TEXT NOT NULL DEFAULT '',
  "featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "category_id" UUID NOT NULL REFERENCES "categories"("id"),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "products_public_code_format_check" CHECK ("public_code" ~ '^[0-9]{5}$')
);

CREATE TABLE "product_variants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "sku" TEXT UNIQUE,
  "name" TEXT NOT NULL DEFAULT 'Default',
  "price" NUMERIC(12, 2) NOT NULL DEFAULT 0,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_variants_price_check" CHECK ("price" >= 0),
  CONSTRAINT "product_variants_stock_check" CHECK ("stock" >= 0)
);

CREATE INDEX "sellers_active_sort_order_idx" ON "sellers"("active", "sort_order");
CREATE INDEX "categories_active_sort_order_idx" ON "categories"("active", "sort_order");
CREATE INDEX "products_active_featured_sort_order_idx" ON "products"("active", "featured", "sort_order");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "product_variants_product_id_active_sort_order_idx" ON "product_variants"("product_id", "active", "sort_order");
