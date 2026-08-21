import { ConflictError, NotFoundError } from "../utils/errors.js";
import { generatePublicCode, isValidPublicCode } from "../utils/product-code.js";
import { slugify } from "../utils/slugify.js";

const DEFAULT_PRODUCT_IMAGE = "assets/logo-smartshop.png";

export function mapProduct(product) {
  const variant = product.variants?.[0] || {};
  const price = Number(variant.price || 0);
  const stock = Number(variant.stock || 0);
  return {
    id: product.id,
    publicCode: product.publicCode,
    code: product.publicCode,
    legacyId: product.legacyId,
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    details: Array.isArray(product.details) ? product.details : [],
    brand: product.brand || "",
    categoryId: product.categoryId,
    category: product.category?.name || "",
    sku: variant.sku || "",
    variant: variant.name && variant.name !== "Default" ? variant.name : "",
    price,
    stock,
    featured: Boolean(product.featured),
    badge: product.badge || "",
    condition: product.condition || "",
    warranty: product.warranty || "",
    delivery: product.delivery || "",
    image: product.image || DEFAULT_PRODUCT_IMAGE,
    active: Boolean(product.active),
    variants: (product.variants || []).map((item) => ({
      id: item.id,
      sku: item.sku || "",
      name: item.name || "Default",
      price: Number(item.price || 0),
      stock: Number(item.stock || 0),
      active: Boolean(item.active),
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function createProductsService({ productsRepository, categoriesRepository }) {
  async function buildCategory(input) {
    if (input.categoryId) {
      const category = await categoriesRepository.findById(input.categoryId);
      if (!category) throw new NotFoundError("Categoria no encontrada.", "CATEGORY_NOT_FOUND");
      return category;
    }
    const name = input.category || "General";
    return categoriesRepository.findOrCreateBySlug({ name, slug: slugify(name, "general") });
  }

  async function createUniquePublicCode(preferredCode) {
    if (isValidPublicCode(preferredCode) && !(await productsRepository.publicCodeExists(preferredCode))) {
      return preferredCode;
    }
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const code = generatePublicCode();
      if (!(await productsRepository.publicCodeExists(code))) return code;
    }
    throw new ConflictError("No se pudo generar un codigo publico unico.", "PUBLIC_CODE_COLLISION");
  }

  async function createUniqueSlug(name, preferredSlug) {
    const root = slugify(preferredSlug || name, "producto");
    let slug = root;
    let suffix = 2;
    while (await productsRepository.slugExists(slug)) {
      slug = `${root}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }

  function normalizeVariants(input) {
    const variants = input.variants?.length
      ? input.variants
      : [
          {
            sku: input.sku || null,
            name: input.variant || "Default",
            price: input.price ?? 0,
            stock: input.stock ?? 0,
            active: true,
          },
        ];

    return variants.map((variant, index) => ({
      sku: variant.sku || null,
      name: variant.name || "Default",
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
      active: variant.active ?? true,
      sortOrder: index,
    }));
  }

  async function list(filters) {
    const result = await productsRepository.list(filters);
    return {
      products: result.items.map(mapProduct),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async function getById(id) {
    const product = await productsRepository.findById(id);
    if (!product) throw new NotFoundError("Producto no encontrado.", "PRODUCT_NOT_FOUND");
    return mapProduct(product);
  }

  async function getByPublicCode(publicCode) {
    const product = await productsRepository.findByPublicCode(publicCode);
    if (!product) throw new NotFoundError("Producto no encontrado.", "PRODUCT_NOT_FOUND");
    return mapProduct(product);
  }

  async function create(input) {
    const category = await buildCategory(input);
    const publicCode = await createUniquePublicCode(input.publicCode || input.code);
    const slug = await createUniqueSlug(input.name, input.slug);
    const data = {
      publicCode,
      legacyId: input.legacyId || null,
      name: input.name,
      slug,
      description: input.description || "",
      details: input.details || [],
      brand: input.brand || "",
      badge: input.badge || "",
      condition: input.condition || "Nuevo",
      warranty: input.warranty || "Garantia de tienda",
      delivery: input.delivery || "Retiro en tienda o envio coordinado",
      image: input.image || DEFAULT_PRODUCT_IMAGE,
      featured: input.featured ?? false,
      active: input.active ?? true,
      categoryId: category.id,
      variants: {
        create: normalizeVariants(input),
      },
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return mapProduct(await productsRepository.create(data));
      } catch (error) {
        if (error.code === "P2002" && String(error.meta?.target || "").includes("public")) {
          data.publicCode = await createUniquePublicCode();
          continue;
        }
        throw error;
      }
    }
    throw new ConflictError("No se pudo crear el producto por colision de codigo.", "PUBLIC_CODE_COLLISION");
  }

  async function update(id, input) {
    await getById(id);
    const data = {};
    const directFields = [
      "name",
      "description",
      "details",
      "brand",
      "badge",
      "condition",
      "warranty",
      "delivery",
      "image",
      "featured",
      "active",
    ];
    directFields.forEach((field) => {
      if (input[field] !== undefined) data[field] = input[field];
    });
    if (input.slug) data.slug = slugify(input.slug, "producto");
    if (input.categoryId || input.category) {
      const category = await buildCategory(input);
      data.categoryId = category.id;
    }
    if (input.variants || input.price !== undefined || input.stock !== undefined || input.sku !== undefined) {
      data.variants = {
        deleteMany: {},
        create: normalizeVariants(input),
      };
    }
    return mapProduct(await productsRepository.update(id, data));
  }

  async function remove(id) {
    await getById(id);
    return mapProduct(await productsRepository.softDelete(id));
  }

  return {
    list,
    getById,
    getByPublicCode,
    create,
    update,
    remove,
    createUniquePublicCode,
    normalizeVariants,
  };
}
