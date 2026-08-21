import { ok } from "../utils/http.js";

export function createHealthController({ prisma }) {
  return {
    async check(req, res) {
      if (prisma?.$queryRaw) {
        await prisma.$queryRaw`SELECT 1`;
      }
      return ok(res, {
        status: "ok",
        database: prisma?.$queryRaw ? "connected" : "not_configured",
      });
    },
  };
}
