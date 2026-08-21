import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const storeDataPath = path.join(rootDir, "public", "assets", "store-data.js");
const outputDir = path.join(rootDir, "supabase", "generated");
const outputPath = path.join(outputDir, "import-store-data.sql");

const source = fs.readFileSync(storeDataPath, "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: storeDataPath });

const catalog = context.window.STORE_DATA || {};
const products = Array.isArray(catalog.products) ? catalog.products : [];
const sellers = Array.isArray(catalog.sellers) ? catalog.sellers : [];
const categoryNames = [...new Set(products.map((product) => product.category || "General"))];

const statements = [
  "-- SmartShop import generated from public/assets/store-data.js",
  "-- Run this after supabase/migrations/20260821160000_smartshop_catalog.sql.",
  "begin;",
  ...categoryNames.map(
    (name, index) => `
insert into public.categories (name, slug, active, sort_order)
values (${sql(name)}, ${sql(slugify(name))}, true, ${index})
on conflict (slug) do update
set name = excluded.name, active = true, sort_order = excluded.sort_order;`.trim()
  ),
  ...products.map(productStatement),
  ...sellers.map(sellerStatement),
  "commit;",
  "",
];

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, statements.join("\n\n"));
console.log(`Archivo generado: ${path.relative(rootDir, outputPath)}`);

function productStatement(product, index) {
  const categorySlug = slugify(product.category || "General");
  const publicCode = /^\d{5}$/.test(String(product.code || "")) ? product.code : null;
  const productSlug = slugify(product.name || `producto-${index + 1}`);
  const variantName = product.variant || "Default";
  const sku = product.sku || null;
  const image = String(product.image || "").startsWith("http") ? product.image : null;
  return `
with category_row as (
  select id from public.categories where slug = ${sql(categorySlug)} limit 1
), product_row as (
  insert into public.products (
    public_code, name, slug, description, brand, category_id, active, featured, sort_order
  )
  select
    ${sql(publicCode)},
    ${sqlText(product.name || "Producto")},
    ${sqlText(productSlug)},
    ${sqlText(product.description || "")},
    ${sqlText(product.brand || "")},
    category_row.id,
    true,
    ${Boolean(product.featured)},
    ${index}
  from category_row
  on conflict (slug) do update
  set
    name = excluded.name,
    description = excluded.description,
    brand = excluded.brand,
    category_id = excluded.category_id,
    active = excluded.active,
    featured = excluded.featured,
    sort_order = excluded.sort_order
  returning id
), variant_row as (
  insert into public.product_variants (product_id, name, sku, price, stock, active, sort_order)
  select id, ${sqlText(variantName)}, ${sql(sku)}, ${Number(product.price || 0)}, ${Number(product.stock || 0)}, true, 0
  from product_row
  on conflict (sku) do update
  set
    name = excluded.name,
    price = excluded.price,
    stock = excluded.stock,
    active = excluded.active
  returning id
)
${image ? `insert into public.product_images (product_id, url, sort_order, is_primary)
select id, ${sql(image)}, 0, true from product_row
where not exists (
  select 1 from public.product_images where product_id = product_row.id and url = ${sql(image)}
);` : "select 1;"}`.trim();
}

function sellerStatement(seller, index) {
  return `
insert into public.sellers (name, whatsapp, role, image_url, active, sort_order)
select
  ${sqlText(seller.name || "Vendedor")},
  ${sqlText(String(seller.phone || "").replace(/\D/g, ""))},
  ${sqlText(seller.role || "")},
  ${sql(String(seller.image || "").startsWith("http") ? seller.image : null)},
  true,
  ${index}
where not exists (
  select 1 from public.sellers
  where name = ${sql(seller.name || "Vendedor")}
    and whatsapp = ${sql(String(seller.phone || "").replace(/\D/g, ""))}
);`.trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function sql(value) {
  if (value === null || value === undefined || value === "") return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlText(value) {
  if (value === null || value === undefined) return "''";
  return `'${String(value).replace(/'/g, "''")}'`;
}
