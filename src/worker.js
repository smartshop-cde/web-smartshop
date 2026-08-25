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

    if (url.pathname === "/api/admin/users") {
      return handleAdminUsers(request, env);
    }

    if (url.pathname === "/api/admin/audit-logs") {
      return handleAuditLogs(request, env);
    }

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

async function handleAdminUsers(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders() });
  }

  let actor;
  try {
    actor = await requireAdmin(request, env);
  } catch (error) {
    return errorResponse(error);
  }

  if (request.method === "GET") {
    try {
      return json({ success: true, data: await listAdminUsers(env) });
    } catch {
      return json(
        {
          success: false,
          error: {
            code: "ADMIN_USERS_UNAVAILABLE",
            message: "No se pudo cargar usuarios admin.",
          },
        },
        502
      );
    }
  }

  if (request.method === "POST") {
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

    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      return json(
        {
          success: false,
          error: {
            code: "INVALID_ADMIN_USER",
            message: "Email valido y contrasena de al menos 8 caracteres son obligatorios.",
          },
        },
        400
      );
    }

    try {
      const createdUser = await createSupabaseUser(env, { email, password });
      await upsertAdminProfile(env, createdUser.id);
      await recordAuditLog(env, actor, {
        table_name: "auth.users",
        record_id: createdUser.id,
        action: "INSERT",
        new_data: {
          id: createdUser.id,
          email: createdUser.email,
          role: "admin",
        },
      });
      return json(
        {
          success: true,
          data: {
            id: createdUser.id,
            email: createdUser.email,
            role: "admin",
            email_confirmed_at: createdUser.email_confirmed_at || null,
            created_at: createdUser.created_at || null,
          },
        },
        201
      );
    } catch (error) {
      return json(
        {
          success: false,
          error: {
            code: "ADMIN_USER_CREATE_FAILED",
            message: readableAdminUserError(error),
          },
        },
        400
      );
    }
  }

  return methodNotAllowed();
}

async function handleAuditLogs(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders() });
  }

  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    await requireAdmin(request, env);
    const logs = await supabaseRest(env, "/audit_logs?select=*&order=created_at.desc&limit=80", { method: "GET" });
    return json({ success: true, data: Array.isArray(logs) ? logs : [] });
  } catch (error) {
    return errorResponse(error, {
      code: "AUDIT_LOGS_UNAVAILABLE",
      message: "No se pudo cargar la auditoria.",
      status: 502,
    });
  }
}

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

async function requireAdmin(request, env) {
  ensureSupabaseAdminEnv(env);
  const token = getBearerToken(request);
  if (!token) {
    throw new HttpError(401, "AUTH_REQUIRED", "Inicia sesion nuevamente.");
  }

  const userResponse = await fetch(`${trimTrailingSlash(env.SUPABASE_URL)}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userResponse.ok) {
    throw new HttpError(401, "AUTH_INVALID", "Sesion no valida.");
  }

  const user = await userResponse.json();
  if (!user?.id) {
    throw new HttpError(401, "AUTH_INVALID", "Sesion no valida.");
  }

  const profiles = await supabaseRest(
    env,
    `/profiles?select=id,role&id=eq.${encodeURIComponent(user.id)}&role=eq.admin&limit=1`,
    { method: "GET" }
  );

  if (!Array.isArray(profiles) || profiles.length === 0) {
    throw new HttpError(403, "ADMIN_REQUIRED", "Tu usuario no tiene permisos de administrador.");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}

async function listAdminUsers(env) {
  const [profiles, authUsersPayload] = await Promise.all([
    supabaseRest(env, "/profiles?select=id,role,created_at,updated_at&role=eq.admin&order=created_at.desc", {
      method: "GET",
    }),
    supabaseAuthAdmin(env, "/users?per_page=100&page=1", { method: "GET" }),
  ]);
  const authUsers = Array.isArray(authUsersPayload?.users)
    ? authUsersPayload.users
    : Array.isArray(authUsersPayload)
      ? authUsersPayload
      : [];
  const authUserMap = new Map(authUsers.map((user) => [user.id, user]));

  return (Array.isArray(profiles) ? profiles : []).map((profile) => {
    const authUser = authUserMap.get(profile.id) || {};
    return {
      id: profile.id,
      email: authUser.email || "",
      role: profile.role,
      email_confirmed_at: authUser.email_confirmed_at || authUser.confirmed_at || null,
      created_at: authUser.created_at || profile.created_at,
    };
  });
}

async function createSupabaseUser(env, { email, password }) {
  const payload = await supabaseAuthAdmin(env, "/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        source: "smartshop-admin",
      },
    }),
  });
  const user = payload?.user || payload;
  if (!user?.id) {
    throw new Error("Invalid Supabase response");
  }
  return user;
}

async function upsertAdminProfile(env, userId) {
  await supabaseRest(env, "/profiles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: userId,
      role: "admin",
    }),
  });
}

async function recordAuditLog(env, actor, entry) {
  try {
    await supabaseRest(env, "/audit_logs", {
      method: "POST",
      body: JSON.stringify({
        actor_id: actor.id,
        actor_email: actor.email,
        table_name: entry.table_name,
        record_id: entry.record_id,
        action: entry.action,
        old_data: entry.old_data || null,
        new_data: entry.new_data || null,
      }),
    });
  } catch {
    // La auditoria no debe impedir que el admin creado pueda entrar.
  }
}

async function supabaseRest(env, path, options = {}) {
  ensureSupabaseAdminEnv(env);
  return supabaseFetch(env, `/rest/v1${path}`, options);
}

async function supabaseAuthAdmin(env, path, options = {}) {
  ensureSupabaseAdminEnv(env);
  return supabaseFetch(env, `/auth/v1/admin${path}`, options);
}

async function supabaseFetch(env, path, options = {}) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${trimTrailingSlash(env.SUPABASE_URL)}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.msg || payload?.message || payload?.error_description || payload?.error || "Supabase error";
    throw new Error(message);
  }
  return payload;
}

function ensureSupabaseAdminEnv(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(503, "ADMIN_API_NOT_CONFIGURED", "La administracion de usuarios no esta configurada.");
  }
}

function extractTranslatedText(response) {
  if (typeof response === "string") return response;
  if (response?.translated_text) return String(response.translated_text);
  if (response?.translatedText) return String(response.translatedText);
  if (response?.translation) return String(response.translation);
  if (response?.response) return String(response.response);
  if (response?.result) return extractTranslatedText(response.result);
  if (response?.data) return extractTranslatedText(response.data);
  if (Array.isArray(response?.translations) && response.translations[0]) {
    return extractTranslatedText(response.translations[0]);
  }
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

function methodNotAllowed() {
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

function errorResponse(error, fallback = null) {
  if (error instanceof HttpError) {
    return json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      error.status
    );
  }

  return json(
    {
      success: false,
      error: {
        code: fallback?.code || "INTERNAL_ERROR",
        message: fallback?.message || "No pudimos completar la accion.",
      },
    },
    fallback?.status || 500
  );
}

function readableAdminUserError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
    return "Ese email ya existe en Supabase.";
  }
  if (message.includes("password")) {
    return "La contrasena no cumple los requisitos de Supabase.";
  }
  return "No se pudo crear el usuario admin.";
}

function getBearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function securityHeaders() {
  return {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "private, max-age=0",
    "X-Content-Type-Options": "nosniff",
  };
}
