export function createProductsRepository(prisma) {
  const include = {
    category: true,
    variants: {
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    },
  };

  function buildWhere(filters = {}) {
    const where = { active: true };

    if (filters.category) {
      where.category = {
        OR: [
          { slug: { equals: filters.category, mode: "insensitive" } },
          { name: { equals: filters.category, mode: "insensitive" } },
        ],
      };
    }

    if (filters.brand) {
      where.brand = { contains: filters.brand, mode: "insensitive" };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { brand: { contains: filters.search, mode: "insensitive" } },
        { publicCode: { contains: filters.search } },
      ];
    }

    const variantFilter = {};
    if (filters.minPrice !== undefined) variantFilter.price = { ...(variantFilter.price || {}), gte: filters.minPrice };
    if (filters.maxPrice !== undefined) variantFilter.price = { ...(variantFilter.price || {}), lte: filters.maxPrice };
    if (filters.inStock) variantFilter.stock = { gt: 0 };
    if (Object.keys(variantFilter).length) {
      where.variants = { some: { active: true, ...variantFilter } };
    }

    return where;
  }

  return {
    async list(filters = {}) {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const where = buildWhere(filters);
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include,
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);
      return { items, total, page, limit };
    },

    findById(id) {
      return prisma.product.findFirst({ where: { id, active: true }, include });
    },

    findByPublicCode(publicCode) {
      return prisma.product.findFirst({ where: { publicCode, active: true }, include });
    },

    publicCodeExists(publicCode) {
      return prisma.product
        .findUnique({ where: { publicCode }, select: { id: true } })
        .then(Boolean);
    },

    slugExists(slug) {
      return prisma.product.findUnique({ where: { slug }, select: { id: true } }).then(Boolean);
    },

    create(data) {
      return prisma.product.create({ data, include });
    },

    update(id, data) {
      return prisma.product.update({ where: { id }, data, include });
    },

    softDelete(id) {
      return prisma.product.update({
        where: { id },
        data: {
          active: false,
          variants: { updateMany: { where: {}, data: { active: false } } },
        },
        include,
      });
    },

    deleteAll(tx = prisma) {
      return tx.product.deleteMany({});
    },
  };
}
