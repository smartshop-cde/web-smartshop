export function createCatalogRepository(prisma) {
  const productInclude = {
    category: true,
    variants: { where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
  };

  return {
    async getCatalog() {
      const [settings, products, sellers] = await Promise.all([
        prisma.storeSetting.findMany(),
        prisma.product.findMany({
          where: { active: true },
          include: productInclude,
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
        prisma.seller.findMany({
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        }),
      ]);
      return { settings, products, sellers };
    },

    async replaceCatalog({ store, products, categories, sellers }) {
      return prisma.$transaction(async (tx) => {
        await tx.productVariant.deleteMany({});
        await tx.product.deleteMany({});
        await tx.category.deleteMany({});
        await tx.seller.deleteMany({});
        await tx.storeSetting.deleteMany({});

        await Promise.all(
          Object.entries(store).map(([key, value]) =>
            tx.storeSetting.create({
              data: { key, value },
            })
          )
        );

        const createdCategories = new Map();
        for (const category of categories) {
          const created = await tx.category.create({ data: category });
          createdCategories.set(category.slug, created);
        }

        for (const product of products) {
          const category = createdCategories.get(product.categorySlug);
          await tx.product.create({
            data: {
              publicCode: product.publicCode,
              legacyId: product.legacyId,
              name: product.name,
              slug: product.slug,
              description: product.description,
              details: product.details,
              brand: product.brand,
              badge: product.badge,
              condition: product.condition,
              warranty: product.warranty,
              delivery: product.delivery,
              image: product.image,
              featured: product.featured,
              active: product.active,
              sortOrder: product.sortOrder,
              categoryId: category.id,
              variants: {
                create: product.variants,
              },
            },
          });
        }

        for (const seller of sellers) {
          await tx.seller.create({ data: seller });
        }
      });
    },

    getAdminPin() {
      return prisma.storeSetting.findUnique({ where: { key: "adminPin" } });
    },
  };
}
