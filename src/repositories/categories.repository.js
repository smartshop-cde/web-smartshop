export function createCategoriesRepository(prisma) {
  return {
    list() {
      return prisma.category.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      });
    },

    findById(id) {
      return prisma.category.findUnique({ where: { id } });
    },

    findBySlug(slug) {
      return prisma.category.findUnique({ where: { slug } });
    },

    create(data) {
      return prisma.category.create({ data });
    },

    async findOrCreateBySlug({ name, slug }) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) return existing;
      return prisma.category.create({ data: { name, slug } });
    },
  };
}
