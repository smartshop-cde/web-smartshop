export class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL_ERROR", details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Datos invalidos.", details) {
    super(message, { status: 400, code: "VALIDATION_ERROR", details });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado.", code = "NOT_FOUND") {
    super(message, { status: 404, code });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto de datos.", code = "CONFLICT") {
    super(message, { status: 409, code });
  }
}
