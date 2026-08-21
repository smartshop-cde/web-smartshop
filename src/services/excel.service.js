import XLSX from "xlsx";

export function createExcelService({ catalogService }) {
  const headers = [
    "accion",
    "code",
    "sku",
    "name",
    "category",
    "price",
    "stock",
    "featured",
    "badge",
    "brand",
    "variant",
    "condition",
    "warranty",
    "delivery",
    "description",
    "details",
  ];

  async function exportProducts() {
    const catalog = await catalogService.getCatalog();
    const rows = catalog.products.map((product) => ({
      accion: "",
      code: product.code,
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      featured: product.featured ? "SI" : "NO",
      badge: product.badge,
      brand: product.brand,
      variant: product.variant,
      condition: product.condition,
      warranty: product.warranty,
      delivery: product.delivery,
      description: product.description,
      details: (product.details || []).join("\n"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  }

  async function importProducts(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const catalog = await catalogService.getCatalog();
    const byCode = new Map(catalog.products.map((product) => [String(product.code || ""), product]));
    let imported = 0;
    let deleted = 0;

    rows.forEach((row) => {
      const code = String(row.code || row.publicCode || "").trim();
      const action = String(row.accion || "").trim().toLowerCase();
      const current = byCode.get(code);
      if (action && ["eliminar", "delete", "quitar", "borrar"].includes(action)) {
        if (current) {
          catalog.products = catalog.products.filter((product) => product !== current);
          deleted += 1;
        }
        return;
      }

      if (!row.name && !current) return;
      const product = {
        ...(current || {}),
        code: code || current?.code,
        sku: String(row.sku || current?.sku || "").trim(),
        name: String(row.name || current?.name || "Producto").trim(),
        category: String(row.category || current?.category || "General").trim(),
        price: Number(row.price || current?.price || 0),
        stock: Number(row.stock || current?.stock || 0),
        featured: ["si", "sí", "true", "1", "yes"].includes(String(row.featured || current?.featured || "").toLowerCase()),
        badge: String(row.badge || current?.badge || "").trim(),
        brand: String(row.brand || current?.brand || "").trim(),
        variant: String(row.variant || current?.variant || "").trim(),
        condition: String(row.condition || current?.condition || "Nuevo").trim(),
        warranty: String(row.warranty || current?.warranty || "Garantia de tienda").trim(),
        delivery: String(row.delivery || current?.delivery || "Retiro en tienda o envio coordinado").trim(),
        description: String(row.description || current?.description || "").trim(),
        details: String(row.details || "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
        image: current?.image || "assets/logo-smartshop.png",
      };

      if (current) {
        catalog.products[catalog.products.indexOf(current)] = product;
      } else {
        catalog.products.push(product);
      }
      imported += 1;
    });

    await catalogService.replaceCatalog(catalog);
    return { imported, deleted, total: catalog.products.length };
  }

  return { exportProducts, importProducts };
}
