import { slugify, uniqueSlug } from "../utils/slugify.js";
import { generatePublicCode, isValidPublicCode } from "../utils/product-code.js";
import { mapProduct } from "./products.service.js";
import { env } from "../config/env.js";

const DEFAULT_ADDRESS =
  "Avda. Adrian Jara esquina Avda. Carlos Antonio Lopez, Galeria Jebai 4to piso, Ciudad del Este, Paraguay";

export function createCatalogService({ catalogRepository }) {
  function settingsToStore(settings) {
    const store = {};
    settings.forEach((setting) => {
      store[setting.key] = setting.value;
    });
    return {
      name: "SmartShop",
      domain: "smartshop.com.py",
      address: DEFAULT_ADDRESS,
      hours: "Lunes a Sabado: 7:30 a 15:30",
      social: {
        instagram: "https://www.instagram.com/smartshopcde",
        tiktok: "https://www.tiktok.com/@smartshopcde",
        username: "@smartshopcde",
      },
      ...store,
    };
  }

  async function getCatalog() {
    const catalog = await catalogRepository.getCatalog();
    return {
      store: settingsToStore(catalog.settings),
      products: catalog.products.map(mapProduct),
      sellers: catalog.sellers.map((seller) => ({
        id: seller.id,
        legacyId: seller.legacyId,
        name: seller.name,
        role: seller.role,
        phone: seller.phone,
        schedule: seller.schedule,
        message: seller.message,
        image: seller.image,
      })),
    };
  }

  async function verifyPin(pin) {
    const setting = await catalogRepository.getAdminPin();
    return String(setting?.value || env.ADMIN_PIN) === String(pin || "");
  }

  function normalizeCatalogForDatabase(catalog) {
    const products = Array.isArray(catalog.products) ? catalog.products : [];
    const sellers = Array.isArray(catalog.sellers) ? catalog.sellers : [];
    const categoryMap = new Map();
    const usedCodes = new Set();
    const usedSlugs = new Set();

    const normalizedProducts = products.map((product, index) => {
      const categoryName = product.category || "General";
      const categorySlug = slugify(categoryName, "general");
      if (!categoryMap.has(categorySlug)) {
        categoryMap.set(categorySlug, {
          name: categoryName,
          slug: categorySlug,
          active: true,
          sortOrder: categoryMap.size,
        });
      }

      let publicCode = String(product.publicCode || product.code || "").trim();
      if (!isValidPublicCode(publicCode) || usedCodes.has(publicCode)) {
        publicCode = generatePublicCode(usedCodes);
      } else {
        usedCodes.add(publicCode);
      }

      return {
        publicCode,
        legacyId: product.legacyId || product.id || null,
        name: product.name || "Producto",
        slug: uniqueSlug(product.slug || product.name || publicCode, usedSlugs),
        description: product.description || "",
        details: Array.isArray(product.details) ? product.details : [],
        brand: product.brand || "",
        badge: product.badge || "",
        condition: product.condition || "Nuevo",
        warranty: product.warranty || "Garantia de tienda",
        delivery: product.delivery || "Retiro en tienda o envio coordinado",
        image: product.image || "assets/logo-smartshop.png",
        featured: Boolean(product.featured),
        active: product.active ?? true,
        sortOrder: index,
        categorySlug,
        variants: [
          {
            sku: product.sku || null,
            name: product.variant || "Default",
            price: Number(product.price || 0),
            stock: Math.max(0, Number(product.stock || 0)),
            active: true,
            sortOrder: 0,
          },
        ],
      };
    });

    const normalizedSellers = sellers.map((seller, index) => ({
      legacyId: seller.legacyId || seller.id || null,
      name: seller.name || "Vendedor",
      role: seller.role || "",
      phone: seller.phone || "",
      schedule: seller.schedule || "",
      message: seller.message || "",
      image: seller.image || "assets/logo-smartshop.png",
      active: true,
      sortOrder: index,
    }));

    return {
      store: catalog.store || {},
      categories: Array.from(categoryMap.values()),
      products: normalizedProducts,
      sellers: normalizedSellers,
    };
  }

  async function replaceCatalog(catalog) {
    await catalogRepository.replaceCatalog(normalizeCatalogForDatabase(catalog));
    return getCatalog();
  }

  return {
    getCatalog,
    replaceCatalog,
    verifyPin,
    normalizeCatalogForDatabase,
  };
}
