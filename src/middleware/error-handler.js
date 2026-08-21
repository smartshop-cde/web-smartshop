import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { isProduction } from "../config/env.js";

export function notFoundHandler(req, res, next) {
  next(new AppError("Ruta no encontrada.", { status: 404, code: "ROUTE_NOT_FOUND" }));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos invalidos.",
        details: error.flatten(),
      },
    });
  }

  const status = error.status || 500;
  const code = error.code || "INTERNAL_ERROR";
  const message = status >= 500 && isProduction ? "Error interno del servidor." : error.message;

  req.log?.error({ err: error, code }, "request failed");
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(error.details && !isProduction ? { details: error.details } : {}),
    },
  });
}
