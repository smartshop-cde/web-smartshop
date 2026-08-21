export const PRODUCT_CODE_MIN = 10000;
export const PRODUCT_CODE_MAX = 99999;
export const PRODUCT_CODE_RE = /^\d{5}$/;

export function isValidPublicCode(value) {
  return PRODUCT_CODE_RE.test(String(value || "").trim());
}

export function generatePublicCode(usedCodes = new Set()) {
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const code = String(Math.floor(PRODUCT_CODE_MIN + Math.random() * (PRODUCT_CODE_MAX - PRODUCT_CODE_MIN + 1)));
    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      return code;
    }
  }
  throw new Error("No se pudo generar un codigo publico unico.");
}
