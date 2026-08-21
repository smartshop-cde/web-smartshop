import { slugify } from "../utils/slugify.js";

export function mapCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    active: category.active,
    productCount: category._count?.products || 0,
  };
}

export function createCategoriesService({ categoriesRepository }) {
  return {
    async list() {
      return (await categoriesRepository.list()).map(mapCategory);
    },

    normalizeName(name) {
      return {
        name: name || "General",
        slug: slugify(name || "General", "general"),
      };
    },
  };
}
