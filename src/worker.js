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

    if (url.pathname === "/api/orders") {
      return handleOrders(request, env);
    }

    if (url.pathname === "/api/orders/status") {
      return handleOrderStatus(request, env);
    }

    if (url.pathname === "/api/admin/orders" || url.pathname.startsWith("/api/admin/orders/")) {
      return handleAdminOrders(request, env);
    }

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

async function handleOrders(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders() });
  }

  if (request.method !== "POST") {
    return methodNotAllowed();
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

  let orderInput;
  try {
    orderInput = validateOrderInput(input);
  } catch (error) {
    return json(
      {
        success: false,
        error: {
          code: "INVALID_ORDER",
          message: error.message,
        },
      },
      400
    );
  }

  try {
    const order = await createCustomerOrder(env, orderInput);
    return json({ success: true, data: order }, 201);
  } catch (error) {
    return errorResponse(error, {
      code: "ORDER_CREATE_FAILED",
      message: "No pudimos crear el pedido.",
      status: 502,
    });
  }
}

async function handleOrderStatus(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders() });
  }

  if (request.method !== "GET") {
    return methodNotAllowed();
  }

  const url = new URL(request.url);
  const orderNumber = normalizeOrderNumber(url.searchParams.get("orderNumber") || url.searchParams.get("code"));
  const whatsapp = normalizePhone(url.searchParams.get("whatsapp"));

  if (!orderNumber || !whatsapp) {
    return json(
      {
        success: false,
        error: {
          code: "INVALID_STATUS_LOOKUP",
          message: "Numero de pedido y WhatsApp son obligatorios.",
        },
      },
      400
    );
  }

  try {
    const order = await findOrderForCustomer(env, { orderNumber, whatsapp });
    if (!order) {
      return json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: "No encontramos un pedido con esos datos.",
          },
        },
        404
      );
    }
    return json({ success: true, data: order });
  } catch (error) {
    return errorResponse(error, {
      code: "ORDER_STATUS_FAILED",
      message: "No pudimos consultar el estado del pedido.",
      status: 502,
    });
  }
}

async function handleAdminOrders(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: securityHeaders() });
  }

  let actor;
  try {
    actor = await requireAdmin(request, env);
  } catch (error) {
    return errorResponse(error);
  }

  if (request.method === "GET" && new URL(request.url).pathname === "/api/admin/orders") {
    try {
      const orders = await supabaseRest(env, "/orders?select=*&order=created_at.desc&limit=120", { method: "GET" });
      const ordersWithItems = await attachOrderItems(env, Array.isArray(orders) ? orders : []);
      return json({ success: true, data: ordersWithItems.map(sanitizeOrderForAdmin) });
    } catch (error) {
      return errorResponse(error, {
        code: "ADMIN_ORDERS_UNAVAILABLE",
        message: `No se pudo cargar pedidos. ${error.message || ""}`.trim(),
        status: 502,
      });
    }
  }

  if (request.method === "PATCH") {
    const orderId = new URL(request.url).pathname.replace("/api/admin/orders/", "").trim();
    if (!isUuid(orderId)) {
      return json(
        {
          success: false,
          error: {
            code: "INVALID_ORDER_ID",
            message: "Pedido invalido.",
          },
        },
        400
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

    const status = normalizeOrderStatus(input.status);
    const adminNotes = String(input.admin_notes || input.adminNotes || "").trim().slice(0, 1000);
    if (!status) {
      return json(
        {
          success: false,
          error: {
            code: "INVALID_ORDER_STATUS",
            message: "Estado de pedido invalido.",
          },
        },
        400
      );
    }

    try {
      const updated = await supabaseRest(env, `/orders?id=eq.${encodeURIComponent(orderId)}&select=*`, {
        method: "PATCH",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes,
        }),
      });
      const order = Array.isArray(updated) ? updated[0] : null;
      if (!order) {
        throw new HttpError(404, "ORDER_NOT_FOUND", "Pedido no encontrado.");
      }
      const [orderWithItems] = await attachOrderItems(env, [order]);
      await recordAuditLog(env, actor, {
        table_name: "orders",
        record_id: orderId,
        action: "UPDATE",
        new_data: {
          status,
          admin_notes: adminNotes,
        },
      });
      return json({ success: true, data: sanitizeOrderForAdmin(orderWithItems || order) });
    } catch (error) {
      return errorResponse(error, {
        code: "ORDER_UPDATE_FAILED",
        message: `No se pudo actualizar el pedido. ${error.message || ""}`.trim(),
        status: 502,
      });
    }
  }

  return methodNotAllowed();
}

function validateOrderInput(input) {
  const customer = input.customer || {};
  const customerName = String(customer.name || input.customerName || "").trim().slice(0, 120);
  const customerWhatsapp = normalizePhone(customer.whatsapp || input.customerWhatsapp);
  const customerEmail = String(customer.email || input.customerEmail || "").trim().toLowerCase().slice(0, 160);
  const notes = String(input.notes || "").trim().slice(0, 1000);
  const items = Array.isArray(input.items) ? input.items : [];

  if (customerName.length < 2) throw new Error("Escribe tu nombre para crear el pedido.");
  if (!customerWhatsapp || customerWhatsapp.length < 8 || customerWhatsapp.length > 18) {
    throw new Error("Escribe un WhatsApp valido para crear el pedido.");
  }
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    throw new Error("El email no tiene un formato valido.");
  }
  if (!items.length) throw new Error("Agrega al menos un producto al carrito.");
  if (items.length > 40) throw new Error("El carrito tiene demasiados productos.");

  const normalizedItems = items.map((item) => {
    const variantId = String(item.variantId || item.productVariantId || "").trim();
    const quantity = Number(item.quantity || 0);
    if (!isUuid(variantId)) throw new Error("Uno de los productos del carrito no es valido.");
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      throw new Error("La cantidad de cada producto debe estar entre 1 y 99.");
    }
    return { variantId, quantity };
  });

  return {
    customerName,
    customerWhatsapp,
    customerEmail,
    notes,
    items: mergeOrderItems(normalizedItems),
  };
}

function mergeOrderItems(items) {
  const byVariant = new Map();
  items.forEach((item) => {
    const current = byVariant.get(item.variantId) || { ...item, quantity: 0 };
    current.quantity += item.quantity;
    byVariant.set(item.variantId, current);
  });
  return [...byVariant.values()];
}

async function createCustomerOrder(env, input) {
  const variants = await loadOrderVariants(env, input.items.map((item) => item.variantId));
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const orderItems = input.items.map((item) => buildOrderItem(item, variantMap.get(item.variantId)));
  const subtotal = roundMoney(orderItems.reduce((sum, item) => sum + item.subtotal_usd, 0));

  const insertedOrders = await supabaseRest(env, "/orders?select=*", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      customer_name: input.customerName,
      customer_whatsapp: input.customerWhatsapp,
      customer_email: input.customerEmail || null,
      status: "new",
      subtotal_usd: subtotal,
      total_usd: subtotal,
      currency: "USD",
      notes: input.notes,
    }),
  });
  const order = Array.isArray(insertedOrders) ? insertedOrders[0] : null;
  if (!order?.id) throw new Error("Invalid order insert response");

  const insertedItems = await supabaseRest(env, "/order_items?select=*", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(orderItems.map((item) => ({ ...item, order_id: order.id }))),
  });

  return sanitizeOrderForCustomer({
    ...order,
    items: Array.isArray(insertedItems) ? insertedItems : [],
  });
}

async function loadOrderVariants(env, ids) {
  const uniqueIds = [...new Set(ids)];
  const idList = uniqueIds.join(",");
  const variants = await supabaseRest(
    env,
    `/product_variants?select=id,product_id,name,sku,color,storage,price,stock,active,product:products(id,name,active)&id=in.(${idList})`,
    { method: "GET" }
  );
  if (!Array.isArray(variants) || variants.length !== uniqueIds.length) {
    throw new HttpError(400, "PRODUCT_UNAVAILABLE", "Uno de los productos ya no esta disponible.");
  }
  return variants;
}

function buildOrderItem(item, variant) {
  if (!variant || variant.active === false || variant.product?.active === false) {
    throw new HttpError(400, "PRODUCT_UNAVAILABLE", "Uno de los productos ya no esta disponible.");
  }
  const stock = Number(variant.stock || 0);
  if (stock < item.quantity) {
    throw new HttpError(409, "INSUFFICIENT_STOCK", `No hay stock suficiente para ${variant.product?.name || "un producto"}.`);
  }

  const unitPrice = roundMoney(Number(variant.price || 0));
  const variantName = [variant.storage, variant.color].filter(Boolean).join(" / ") || variant.name || "";
  return {
    product_id: variant.product_id,
    product_variant_id: variant.id,
    product_name: variant.product?.name || "Producto SmartShop",
    variant_name: variantName === "Default" ? "" : variantName,
    public_code: variant.sku || "",
    unit_price_usd: unitPrice,
    quantity: item.quantity,
    subtotal_usd: roundMoney(unitPrice * item.quantity),
    image_url: null,
  };
}

async function findOrderForCustomer(env, { orderNumber, whatsapp }) {
  const orders = await supabaseRest(
    env,
    `/orders?select=*&order_number=eq.${encodeURIComponent(orderNumber)}&customer_whatsapp=eq.${encodeURIComponent(whatsapp)}&limit=1`,
    { method: "GET" }
  );
  const order = Array.isArray(orders) ? orders[0] : null;
  if (!order) return null;
  const [orderWithItems] = await attachOrderItems(env, [order]);
  return sanitizeOrderForCustomer(orderWithItems || order);
}

async function attachOrderItems(env, orders) {
  const orderIds = orders.map((order) => order.id).filter(Boolean);
  if (!orderIds.length) return orders.map((order) => ({ ...order, items: [] }));

  const items = await supabaseRest(
    env,
    `/order_items?select=*&order_id=in.(${orderIds.join(",")})&order=created_at.asc`,
    { method: "GET" }
  );
  const itemsByOrder = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const list = itemsByOrder.get(item.order_id) || [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  });

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) || [],
  }));
}

function sanitizeOrderForCustomer(order) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    status: order.status,
    statusLabel: getOrderStatusLabel(order.status),
    subtotalUsd: Number(order.subtotal_usd || 0),
    totalUsd: Number(order.total_usd || 0),
    currency: order.currency || "USD",
    notes: order.notes || "",
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: sanitizeOrderItems(order.items || []),
  };
}

function sanitizeOrderForAdmin(order) {
  return {
    ...sanitizeOrderForCustomer(order),
    customerWhatsapp: order.customer_whatsapp,
    customerEmail: order.customer_email || "",
    adminNotes: order.admin_notes || "",
  };
}

function sanitizeOrderItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productVariantId: item.product_variant_id,
    productName: item.product_name,
    variantName: item.variant_name || "",
    publicCode: item.public_code || "",
    unitPriceUsd: Number(item.unit_price_usd || 0),
    quantity: Number(item.quantity || 0),
    subtotalUsd: Number(item.subtotal_usd || 0),
    imageUrl: item.image_url || "",
  }));
}

function normalizeOrderStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  return ["new", "confirmed", "preparing", "ready", "delivered", "cancelled"].includes(status) ? status : "";
}

function getOrderStatusLabel(status) {
  const labels = {
    new: "Recibido",
    confirmed: "Confirmado",
    preparing: "En preparacion",
    ready: "Listo para retirar",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return labels[status] || labels.new;
}

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
      const savedUser = await createOrUpdateSupabaseUser(env, { email, password });
      await upsertAdminProfile(env, savedUser.id);
      await recordAuditLog(env, actor, {
        table_name: "auth.users",
        record_id: savedUser.id,
        action: savedUser.existing ? "UPDATE" : "INSERT",
        new_data: {
          id: savedUser.id,
          email: savedUser.email,
          role: "admin",
        },
      });
      return json(
        {
          success: true,
          data: {
            id: savedUser.id,
            email: savedUser.email,
            role: "admin",
            existing: Boolean(savedUser.existing),
            email_confirmed_at: savedUser.email_confirmed_at || null,
            created_at: savedUser.created_at || null,
          },
        },
        savedUser.existing ? 200 : 201
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
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
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

async function createOrUpdateSupabaseUser(env, { email, password }) {
  try {
    return await createSupabaseUser(env, { email, password });
  } catch (error) {
    if (!isDuplicateUserError(error)) throw error;
    const existingUser = await findSupabaseUserByEmail(env, email);
    if (!existingUser?.id) throw error;
    const updatedUser = await updateSupabaseUser(env, existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        source: "smartshop-admin",
      },
    });
    return {
      ...existingUser,
      ...updatedUser,
      id: existingUser.id,
      email: updatedUser.email || existingUser.email,
      existing: true,
    };
  }
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
  return { ...user, existing: false };
}

async function updateSupabaseUser(env, userId, attributes) {
  try {
    return await updateSupabaseUserAtPath(env, `/users/${encodeURIComponent(userId)}`, attributes);
  } catch (error) {
    if (!isNotFoundError(error)) throw error;
    return updateSupabaseUserAtPath(env, `/user/${encodeURIComponent(userId)}`, attributes);
  }
}

async function updateSupabaseUserAtPath(env, path, attributes) {
  const payload = await supabaseAuthAdmin(env, path, {
    method: "PUT",
    body: JSON.stringify(attributes),
  });
  return payload?.user || payload;
}

async function findSupabaseUserByEmail(env, email) {
  const payload = await supabaseAuthAdmin(env, "/users?per_page=1000&page=1", { method: "GET" });
  const users = Array.isArray(payload?.users) ? payload.users : Array.isArray(payload) ? payload : [];
  return users.find((user) => String(user.email || "").toLowerCase() === email) || null;
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
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function ensureSupabaseAdminEnv(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(503, "SUPABASE_SERVER_NOT_CONFIGURED", "La conexion segura con Supabase no esta configurada.");
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

function isDuplicateUserError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("already") || message.includes("registered") || message.includes("exists");
}

function isNotFoundError(error) {
  const message = String(error?.message || "").toLowerCase();
  return error?.status === 404 || message.includes("404") || message.includes("not found");
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 18);
}

function normalizeOrderNumber(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 32);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
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
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "private, max-age=0",
    "X-Content-Type-Options": "nosniff",
  };
}
