const MAX_TEXTS_PER_REQUEST = 80;
const MAX_TOTAL_CHARS = 12000;
const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";
const LANGUAGE_NAMES = {
  es: "spanish",
  pt: "portuguese",
};

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

  if (!env.AI) {
    return json(
      {
        success: false,
        error: {
          code: "TRANSLATE_NOT_CONFIGURED",
          message: "Cloudflare Workers AI no esta configurado.",
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

  const cacheKey = await getCacheKey({ model: TRANSLATION_MODEL, texts, source, target });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let translations;
  try {
    translations = await translateWithWorkersAi(env, texts, { source, target });
  } catch {
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

async function translateWithWorkersAi(env, texts, options) {
  const sourceLang = LANGUAGE_NAMES[options.source] || LANGUAGE_NAMES.es;
  const targetLang = LANGUAGE_NAMES[options.target];
  const translations = [];

  if (!targetLang) {
    throw new Error("Unsupported target language");
  }

  for (const text of texts) {
    const response = await env.AI.run(TRANSLATION_MODEL, {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    });
    translations.push(extractTranslatedText(response));
  }

  return translations;
}

function extractTranslatedText(response) {
  if (typeof response === "string") return response;
  if (response?.translated_text) return String(response.translated_text);
  if (response?.translatedText) return String(response.translatedText);
  if (response?.translation) return String(response.translation);
  if (response?.text) return String(response.text);
  return "";
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
