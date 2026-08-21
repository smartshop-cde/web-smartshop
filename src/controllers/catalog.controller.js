import { legacy, ok } from "../utils/http.js";

export function createCatalogController({ catalogService, excelService }) {
  return {
    async getCatalog(req, res) {
      return legacy(res, await catalogService.getCatalog());
    },

    async replaceCatalog(req, res) {
      await catalogService.replaceCatalog(req.body || {});
      return ok(res, { ok: true });
    },

    async login(req, res) {
      const valid = await catalogService.verifyPin(req.body?.pin);
      if (!valid) {
        return res.status(401).json({ ok: false, error: "PIN incorrecto" });
      }
      return res.json({ ok: true });
    },

    async exportExcel(req, res) {
      const body = await excelService.exportProducts();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="smartshop-productos.xlsx"');
      return res.send(body);
    },

    async importExcel(req, res) {
      const result = await excelService.importProducts(req.body);
      return res.json(result);
    },
  };
}
