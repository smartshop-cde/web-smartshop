export function createAdminAuth(catalogService) {
  return async function adminAuth(req, res, next) {
    try {
      const pin = req.get("X-Admin-Pin") || "";
      if (await catalogService.verifyPin(pin)) return next();
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No autorizado",
        },
      });
    } catch (error) {
      return next(error);
    }
  };
}
