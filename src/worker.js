const MAX_TEXTS_PER_REQUEST = 80;
const MAX_TOTAL_CHARS = 12000;
const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/translate") {
      return handleTranslate(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/")) {
      return json(
        {
          success: false,
          error: {
            code: "API_NOT_FOUND",
            message: "Endpoint no encontrado.",
          },
        },
        404
      );
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleTranslate(request, env, ctx) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders() });
  }

  if (request.method !== "POST") {
    return json(
      {
        success: false,
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Metodo no permitido.",
        },
      },
      405
    );
  }

  if (!env.GOOGLE_TRANSLATE_API_KEY) {
    return json(
      {
        success: false,
        error: {
          code: "TRANSLATE_NOT_CONFIGURED",
          message: "Google Translate no esta configurado.",
        },
      },
      503
    );
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "JSON invalido.",
        },
      },
      400
    );
  }

  const texts = Array.isArray(input.texts)
    ? input.texts.map((text) => String(text || "").trim()).filter(Boolean)
    : [];
  const target = normalizeLanguage(input.target);
  const source = normalizeLanguage(input.source);
  const totalChars = texts.reduce((sum, text) => sum + text.length, 0);

  if (!texts.length || texts.length > MAX_TEXTS_PER_REQUEST || totalChars > MAX_TOTAL_CHARS || !target) {
    return json(
      {
        success: false,
        error: {
          code: "INVALID_TRANSLATE_INPUT",
          message: "Solicitud de traduccion invalida.",
        },
      },
      400
    );
  }

  const cacheKey = await getCacheKey({ texts, source, target });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const googleUrl = new URL(GOOGLE_TRANSLATE_ENDPOINT);
  googleUrl.searchParams.set("key", env.GOOGLE_TRANSLATE_API_KEY);

  const response = await fetch(googleUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      q: texts,
      source: source || undefined,
      target,
      format: "text",
    }),
  });

  if (!response.ok) {
    return json(
      {
        success: false,
        error: {
          code: "TRANSLATE_PROVIDER_ERROR",
          message: "No se pudo traducir el texto.",
        },
      },
      502
    );
  }

  const payload = await response.json();
  const translations = (payload.data?.translations || []).map((entry) => decodeHtmlEntities(entry.translatedText || ""));
  const result = json({
    success: true,
    data: {
      source,
      target,
      translations,
    },
  });

  ctx.waitUntil(cache.put(cacheKey, result.clone()));
  return result;
}

function normalizeLanguage(value) {
  const language = String(value || "").trim().toLowerCase();
  return ["es", "pt"].includes(language) ? language : "";
}

async function getCacheKey(payload) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return new Request(`https://smartshop.local/translate-cache/${hash}`);
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...securityHeaders(),
    },
  });
}

function securityHeaders() {
  return {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "private, max-age=0",
    "X-Content-Type-Options": "nosniff",
  };
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ccedil;/g, "ç")
    .replace(/&atilde;/g, "ã")
    .replace(/&otilde;/g, "õ")
    .replace(/&aacute;/g, "á")
    .replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&acirc;/g, "â")
    .replace(/&ecirc;/g, "ê")
    .replace(/&ocirc;/g, "ô")
    .replace(/&agrave;/g, "à")
    .replace(/&uuml;/g, "ü")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}
