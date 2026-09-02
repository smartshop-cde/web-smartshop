(function () {
  const CONFIG = {
    url: String(window.SMARTSHOP_SUPABASE_URL || "").trim(),
    anonKey: String(window.SMARTSHOP_SUPABASE_ANON_KEY || "").trim(),
    productBucket: "product-images",
    sellerBucket: "seller-images",
    imageMaxBytes: 5 * 1024 * 1024,
    imageTypes: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  };
  const DEFAULT_EXCHANGE_RATES = {
    baseCurrency: "USD",
    usdToBrl: 5.27,
    usdToPyg: 6100,
  };

  let client;

  function isConfigured() {
    return Boolean(CONFIG.url && CONFIG.anonKey && window.supabase?.createClient);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
    }
    return client;
  }

  function requireClient() {
    const supabase = getClient();
    if (!supabase) {
      throw new Error("Supabase no esta configurado.");
    }
    return supabase;
  }

  async function loadPublicCatalog(options = {}) {
    const supabase = requireClient();
    const limit = Number(options.limit || 120);
    const [categoriesResult, sellersResult, productsResult, settings] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name,slug,active,sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("sellers")
        .select("id,name,whatsapp,role,image_url,active,sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      fetchProducts({ activeOnly: true, limit, includeVariantImages: true }),
      loadStoreSettings(),
    ]);

    assertSupabaseResult(categoriesResult, "No pudimos cargar categorias.");
    assertSupabaseResult(sellersResult, "No pudimos cargar vendedores.");
    assertSupabaseResult(productsResult, "No pudimos cargar productos.");

    return {
      store: getStaticStore(settings),
      settings,
      categories: categoriesResult.data || [],
      products: (productsResult.data || []).map(mapProductRow),
      sellers: (sellersResult.data || []).map(mapSellerRow),
    };
  }

  async function searchPublicProducts(search, options = {}) {
    const supabase = requireClient();
    const term = sanitizeSearchTerm(search);
    if (term.length < 2) return [];

    const limit = Number(options.limit || 80);
    const pattern = `*${term}*`;

    const [productsResult, variantsResult, categoriesResult] = await Promise.all([
      fetchProducts({
        activeOnly: true,
        limit,
        includeVariantImages: true,
        searchPattern: `name.ilike.${pattern},slug.ilike.${pattern},brand.ilike.${pattern},description.ilike.${pattern},public_code.ilike.${pattern}`,
      }),
      supabase
        .from("product_variants")
        .select("product_id")
        .eq("active", true)
        .or(`name.ilike.${pattern},sku.ilike.${pattern},color.ilike.${pattern},storage.ilike.${pattern}`)
        .limit(limit),
      supabase
        .from("categories")
        .select("id")
        .eq("active", true)
        .or(`name.ilike.${pattern},slug.ilike.${pattern}`)
        .limit(limit),
    ]);

    assertSupabaseResult(productsResult, "No pudimos buscar productos.");
    assertSupabaseResult(variantsResult, "No pudimos buscar variantes.");
    assertSupabaseResult(categoriesResult, "No pudimos buscar categorias.");

    const productIds = unique((variantsResult.data || []).map((row) => row.product_id).filter(Boolean));
    const categoryIds = unique((categoriesResult.data || []).map((row) => row.id).filter(Boolean));
    const relatedQueries = [];

    if (productIds.length) {
      relatedQueries.push(
        fetchProducts({ activeOnly: true, limit, includeVariantImages: true, ids: productIds })
      );
    }

    if (categoryIds.length) {
      relatedQueries.push(
        fetchProducts({ activeOnly: true, limit, includeVariantImages: true, categoryIds })
      );
    }

    const relatedResults = relatedQueries.length ? await Promise.all(relatedQueries) : [];
    relatedResults.forEach((result) => assertSupabaseResult(result, "No pudimos completar la busqueda."));

    return uniqueById([
      ...(productsResult.data || []),
      ...relatedResults.flatMap((result) => result.data || []),
    ]).map(mapProductRow);
  }

  async function loadAdminCatalog() {
    const supabase = requireClient();
    const [categoriesResult, sellersResult, productsResult, settings] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name,slug,active,sort_order,created_at,updated_at")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("sellers")
        .select("id,name,whatsapp,role,image_url,active,sort_order,created_at,updated_at")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      fetchProducts({ admin: true, includeVariantImages: true }),
      loadStoreSettings(),
    ]);

    assertSupabaseResult(categoriesResult, "No pudimos cargar categorias.");
    assertSupabaseResult(sellersResult, "No pudimos cargar vendedores.");
    assertSupabaseResult(productsResult, "No pudimos cargar productos.");

    return {
      settings,
      categories: categoriesResult.data || [],
      sellers: sellersResult.data || [],
      products: (productsResult.data || []).map((product) => ({
        ...product,
        variants: sortByOrder(product.variants || []),
        images: sortImages(product.images || []),
      })),
    };
  }

  async function loadStoreSettings() {
    const supabase = requireClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("key,value")
      .in("key", ["exchange_rates"]);

    if (error) {
      return { exchangeRates: { ...DEFAULT_EXCHANGE_RATES } };
    }

    return normalizeSettings(data || []);
  }

  async function signIn(email, password) {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email o contrasena incorrectos.");
    await assertAdmin(data.user?.id);
    return data;
  }

  async function signOut() {
    await requireClient().auth.signOut();
  }

  async function getSession() {
    const { data, error } = await requireClient().auth.getSession();
    if (error) throw new Error("No pudimos verificar la sesion.");
    return data.session;
  }

  async function sendPasswordReset(email) {
    const redirectTo = `${window.location.origin}/admin`;
    const { error } = await requireClient().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error("No pudimos enviar el enlace de contrasena.");
  }

  async function updatePassword(password) {
    const { data, error } = await requireClient().auth.updateUser({ password });
    if (error) throw new Error("No pudimos guardar la contrasena.");
    return data;
  }

  async function getAccessToken() {
    const session = await getSession();
    return session?.access_token || "";
  }

  async function listAdminUsers() {
    return callAdminEndpoint("/api/admin/users", { method: "GET" });
  }

  async function createAdminUser(payload) {
    return callAdminEndpoint("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function listAuditLogs() {
    return callAdminEndpoint("/api/admin/audit-logs", { method: "GET" });
  }

  async function createOrder(payload) {
    return callPublicEndpoint("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function getOrderStatus({ orderNumber, whatsapp }) {
    const params = new URLSearchParams({
      orderNumber: String(orderNumber || "").trim(),
      whatsapp: String(whatsapp || "").trim(),
    });
    return callPublicEndpoint(`/api/orders/status?${params.toString()}`, { method: "GET" });
  }

  async function listOrders() {
    return callAdminEndpoint("/api/admin/orders", { method: "GET" });
  }

  async function updateOrderStatus(orderId, payload) {
    return callAdminEndpoint(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async function assertAdmin(userId) {
    if (!userId) throw new Error("Sesion no valida.");
    const { data, error } = await requireClient()
      .from("profiles")
      .select("id,role")
      .eq("id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Tu usuario no tiene permisos de administrador.");
    }
    return data;
  }

  async function callAdminEndpoint(path, options = {}) {
    const token = await getAccessToken();
    if (!token) throw new Error("Inicia sesion nuevamente.");
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error?.message || "No pudimos completar la accion.");
    }
    return payload.data;
  }

  async function callPublicEndpoint(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error?.message || "No pudimos completar la accion.");
    }
    return payload.data;
  }

  async function uploadImage(file, bucket, scope) {
    validateImageFile(file);
    const safeName = sanitizeFileName(file.name);
    const path = `${scope}/${Date.now()}-${safeName}`;
    const { error } = await requireClient().storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw new Error("No se pudo subir la imagen.");
    const { data } = requireClient().storage.from(bucket).getPublicUrl(path);
    return { path, url: data.publicUrl };
  }

  async function fetchProducts(options = {}) {
    const supabase = requireClient();
    const includeVariantImages = options.includeVariantImages !== false;
    let query = supabase.from("products").select(productSelect(includeVariantImages));

    if (options.activeOnly) query = query.eq("active", true);
    if (options.searchPattern) query = query.or(options.searchPattern);
    if (options.ids?.length) query = query.in("id", options.ids);
    if (options.categoryIds?.length) query = query.in("category_id", options.categoryIds);

    query = query.order("featured", { ascending: false }).order("name", { ascending: true });
    if (options.limit) query = query.limit(Number(options.limit));

    const result = await query;
    if (
      result.error &&
      includeVariantImages &&
      String(result.error.message || "").includes("image_url") &&
      String(result.error.message || "").includes("product_variants")
    ) {
      return fetchProducts({ ...options, includeVariantImages: false });
    }
    return result;
  }

  function productSelect(includeVariantImages = true) {
    const variantFields = ["id", "name", "sku", "color", "storage", includeVariantImages ? "image_url" : "", "price", "stock", "active", "sort_order"]
      .filter(Boolean)
      .join(",");
    return `id,public_code,name,slug,description,brand,active,featured,category_id,category:categories(id,name,slug),variants:product_variants(${variantFields}),images:product_images(id,url,sort_order,is_primary,created_at)`;
  }

  function validateImageFile(file) {
    if (!file) return;
    if (!CONFIG.imageTypes.has(file.type)) {
      throw new Error("La imagen debe ser JPG, PNG, WebP o GIF.");
    }
    if (file.size > CONFIG.imageMaxBytes) {
      throw new Error("La imagen no puede superar 5 MB.");
    }
  }

  function mapProductRow(row) {
    const variants = sortByOrder(row.variants || []).filter((variant) => variant.active !== false);
    const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
    const prices = variants.map((variant) => Number(variant.price || 0)).filter((price) => price >= 0);
    const price = prices.length ? Math.min(...prices) : 0;
    const primaryVariant = getDisplayVariant(variants, price);
    const image = primaryVariant.image_url ? { url: primaryVariant.image_url } : getPrimaryImage(row.images || []);
    const categoryName = row.category?.name || "General";

    return {
      id: row.id,
      code: primaryVariant.sku || row.public_code,
      sku: primaryVariant.sku || "",
      name: row.name,
      category: categoryName,
      categorySlug: row.category?.slug || "",
      brand: row.brand || "",
      variant: formatVariantLabel(primaryVariant) !== "Default" ? formatVariantLabel(primaryVariant) : "",
      price,
      stock: totalStock,
      featured: Boolean(row.featured),
      badge: "",
      condition: "Nuevo",
      warranty: "Garantia de tienda",
      delivery: totalStock > 0 ? "Retiro en tienda o envio coordinado" : "Consultar proxima reposicion",
      description: row.description || "",
      details: variants.map(formatVariantLabel).filter((name) => name && name !== "Default"),
      image: image?.url || "assets/logo-smartshop.png",
      slug: row.slug,
      active: row.active,
      variants: variants.map((variant) => ({
        ...variant,
        label: formatVariantLabel(variant),
        image: variant.image_url || image?.url || "assets/logo-smartshop.png",
      })),
    };
  }

  function getDisplayVariant(variants, price) {
    if (!variants.length) return {};
    return (
      variants.find((variant) => Number(variant.stock || 0) > 0 && Number(variant.price || 0) === price) ||
      variants.find((variant) => Number(variant.stock || 0) > 0) ||
      variants.find((variant) => Number(variant.price || 0) === price) ||
      variants[0]
    );
  }

  function formatVariantLabel(variant) {
    return [variant.storage, variant.color].filter(Boolean).join(" / ") || variant.name || "";
  }

  function mapSellerRow(row) {
    return {
      id: row.id,
      name: row.name,
      role: row.role || "",
      phone: row.whatsapp || "",
      schedule: "Lunes a Sabado: 7:30 a 15:30",
      message: "",
      image: row.image_url || "assets/logo-smartshop.png",
      active: row.active,
    };
  }

  function getStaticStore(settings = {}) {
    const fallback = window.STORE_DATA?.store || {};
    return {
      ...fallback,
      hours: "Lunes a Sabado: 7:30 a 15:30",
      address:
        "Avda. Adrian Jara esquina Avda. Carlos Antonio Lopez, Galeria Jebai 4to piso, Ciudad del Este, Paraguay",
      social: {
        instagram: "https://www.instagram.com/smartshopcde",
        tiktok: "https://www.tiktok.com/@smartshopcde",
        username: "@smartshopcde",
        ...(fallback.social || {}),
      },
      exchangeRates: normalizeExchangeRates(settings.exchangeRates || fallback.exchangeRates),
    };
  }

  function normalizeSettings(rows) {
    const map = new Map(rows.map((row) => [row.key, row.value || {}]));
    return {
      exchangeRates: normalizeExchangeRates(map.get("exchange_rates")),
    };
  }

  function normalizeExchangeRates(value = {}) {
    const usdToBrl = Number(value.usdToBrl ?? value.usd_to_brl ?? DEFAULT_EXCHANGE_RATES.usdToBrl);
    const usdToPyg = Number(value.usdToPyg ?? value.usd_to_pyg ?? DEFAULT_EXCHANGE_RATES.usdToPyg);
    return {
      baseCurrency: "USD",
      usdToBrl: Number.isFinite(usdToBrl) && usdToBrl > 0 ? usdToBrl : DEFAULT_EXCHANGE_RATES.usdToBrl,
      usdToPyg: Number.isFinite(usdToPyg) && usdToPyg > 0 ? usdToPyg : DEFAULT_EXCHANGE_RATES.usdToPyg,
    };
  }

  function getPrimaryImage(images) {
    return sortImages(images).find((image) => image.is_primary) || sortImages(images)[0];
  }

  function sortImages(images) {
    return [...images].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function sortByOrder(rows) {
    return [...rows].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function assertSupabaseResult(result, message) {
    if (result.error) {
      throw new Error(message);
    }
  }

  function sanitizeFileName(fileName) {
    const extension = String(fileName || "imagen.webp").split(".").pop().toLowerCase();
    const base = String(fileName || "imagen")
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    return `${base || "imagen"}.${extension || "webp"}`;
  }

  function sanitizeSearchTerm(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[(),.%*_]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function uniqueById(rows) {
    return [...new Map(rows.map((row) => [row.id, row])).values()];
  }

  function toSlug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  }

  window.SmartShopSupabase = {
    config: CONFIG,
    isConfigured,
    getClient,
    requireClient,
    loadPublicCatalog,
    searchPublicProducts,
    loadAdminCatalog,
    loadStoreSettings,
    signIn,
    signOut,
    getSession,
    sendPasswordReset,
    updatePassword,
    assertAdmin,
    listAdminUsers,
    createAdminUser,
    listAuditLogs,
    createOrder,
    getOrderStatus,
    listOrders,
    updateOrderStatus,
    uploadImage,
    toSlug,
  };
})();
