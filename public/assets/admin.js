(function () {
  const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
  const IMPORT_COLUMNS = [
    ["nombre", "Nombre del producto"],
    ["marca", "Marca"],
    ["categoria", "Categoria"],
    ["variante", "Variante"],
    ["color", "Color"],
    ["almacenamiento", "Almacenamiento"],
    ["precio", "Precio USD"],
    ["stock", "Stock"],
    ["descripcion", "Descripcion"],
    ["destacado", "Destacado: si/no"],
    ["activo", "Activo: si/no"],
  ];
  const DEFAULT_EXCHANGE_RATES = {
    usdToBrl: 5.27,
    usdToPyg: 6100,
  };
  const FALLBACK_LOGO = "/assets/logo-smartshop.png";
  const TEMPLATE_ROWS = [
    {
      nombre: "iPhone 15 128 GB",
      marca: "Apple",
      categoria: "Celulares",
      variante: "128 GB Azul",
      color: "Azul",
      almacenamiento: "128 GB",
      precio: 1016.39,
      stock: 5,
      descripcion: "Equipo sellado con garantia de tienda",
      destacado: "si",
      activo: "si",
    },
    {
      nombre: "AirPods Pro 2",
      marca: "Apple",
      categoria: "Audio",
      variante: "Default",
      color: "Blanco",
      almacenamiento: "",
      precio: 303.28,
      stock: 3,
      descripcion: "Cancelacion activa de ruido",
      destacado: "no",
      activo: "si",
    },
  ];
  const els = {};
  const state = {
    catalog: { products: [], categories: [], sellers: [], settings: { exchangeRates: DEFAULT_EXCHANGE_RATES } },
    adminUsers: [],
    adminUsersError: "",
    auditLogs: [],
    auditLogsError: "",
    orders: [],
    ordersError: "",
    pendingImport: null,
    loading: false,
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    bindEvents();

    if (!window.SmartShopSupabase?.isConfigured()) {
      showLogin();
      setLoginError("Configura SUPABASE_URL y SUPABASE_ANON_KEY para usar el panel.");
      setLoginDisabled(true);
      return;
    }

    try {
      const session = await window.SmartShopSupabase.getSession();
      if (session?.user && isPasswordSetupFlow()) {
        showPasswordSetup();
      } else if (session?.user) {
        await window.SmartShopSupabase.assertAdmin(session.user.id);
        await showAdmin();
      } else {
        showLogin();
      }
    } catch (error) {
      await window.SmartShopSupabase.signOut().catch(() => {});
      showLogin();
      setLoginError(error.message);
    }
  }

  function cacheElements() {
    els.loginView = document.querySelector("#loginView");
    els.passwordSetupView = document.querySelector("#passwordSetupView");
    els.adminView = document.querySelector("#adminView");
    els.loginForm = document.querySelector("#loginForm");
    els.passwordSetupForm = document.querySelector("#passwordSetupForm");
    els.emailInput = document.querySelector("#emailInput");
    els.passwordInput = document.querySelector("#passwordInput");
    els.passwordToggles = [...document.querySelectorAll("[data-password-toggle]")];
    els.loginButton = document.querySelector("#loginButton");
    els.sendPasswordLinkButton = document.querySelector("#sendPasswordLinkButton");
    els.setupPasswordInput = document.querySelector("#setupPasswordInput");
    els.setupPasswordConfirmInput = document.querySelector("#setupPasswordConfirmInput");
    els.setupPasswordButton = document.querySelector("#setupPasswordButton");
    els.passwordSetupError = document.querySelector("#passwordSetupError");
    els.loginError = document.querySelector("#loginError");
    els.logoutButton = document.querySelector("#logoutButton");
    els.reloadButton = document.querySelector("#reloadButton");
    els.adminSyncStatus = document.querySelector("#adminSyncStatus");
    els.dashboardCards = document.querySelector("#dashboardCards");
    els.activeProductsCount = document.querySelector("#activeProductsCount");
    els.soldOutProductsCount = document.querySelector("#soldOutProductsCount");
    els.categoryCount = document.querySelector("#categoryCount");
    els.sellerCount = document.querySelector("#sellerCount");
    els.openOrdersCount = document.querySelector("#openOrdersCount");
    els.productsTable = document.querySelector("#productsTable");
    els.ordersTable = document.querySelector("#ordersTable");
    els.categoriesTable = document.querySelector("#categoriesTable");
    els.sellersTable = document.querySelector("#sellersTable");
    els.productEditor = document.querySelector("#productEditor");
    els.categoryEditor = document.querySelector("#categoryEditor");
    els.sellerEditor = document.querySelector("#sellerEditor");
    els.exchangeRatesForm = document.querySelector("#exchangeRatesForm");
    els.usdToBrlInput = document.querySelector("#usdToBrlInput");
    els.usdToPygInput = document.querySelector("#usdToPygInput");
    els.exchangePreview = document.querySelector("#exchangePreview");
    els.createAdminUserForm = document.querySelector("#createAdminUserForm");
    els.newAdminEmailInput = document.querySelector("#newAdminEmailInput");
    els.newAdminPasswordInput = document.querySelector("#newAdminPasswordInput");
    els.createAdminUserButton = document.querySelector("#createAdminUserButton");
    els.adminUsersTable = document.querySelector("#adminUsersTable");
    els.refreshAuditButton = document.querySelector("#refreshAuditButton");
    els.refreshOrdersButton = document.querySelector("#refreshOrdersButton");
    els.auditLogsTable = document.querySelector("#auditLogsTable");
    els.importPreview = document.querySelector("#importPreview");
    els.downloadTemplateButton = document.querySelector("#downloadTemplateButton");
    els.importProductsInput = document.querySelector("#importProductsInput");
    els.newProductButton = document.querySelector("#newProductButton");
    els.newCategoryButton = document.querySelector("#newCategoryButton");
    els.newSellerButton = document.querySelector("#newSellerButton");
    els.toastRegion = document.querySelector("#toastRegion");
    els.tabs = [...document.querySelectorAll("[data-admin-tab]")];
    els.panels = [...document.querySelectorAll(".admin-tab-panel")];
  }

  function bindEvents() {
    els.loginForm.addEventListener("submit", handleLogin);
    els.passwordSetupForm.addEventListener("submit", handlePasswordSetup);
    els.passwordToggles.forEach((button) => button.addEventListener("click", togglePasswordVisibility));
    els.sendPasswordLinkButton.addEventListener("click", handleSendPasswordLink);
    els.logoutButton.addEventListener("click", handleLogout);
    els.reloadButton.addEventListener("click", () => loadAndRenderCatalog(true));
    els.createAdminUserForm.addEventListener("submit", handleCreateAdminUser);
    els.refreshAuditButton.addEventListener("click", () => loadAndRenderAuditLogs(true));
    els.refreshOrdersButton.addEventListener("click", () => loadAndRenderOrders(true));
    els.downloadTemplateButton.addEventListener("click", downloadImportTemplate);
    els.importProductsInput.addEventListener("change", handleImportFile);
    els.newProductButton.addEventListener("click", () => openProductEditor());
    els.newCategoryButton.addEventListener("click", () => openCategoryEditor());
    els.newSellerButton.addEventListener("click", () => openSellerEditor());

    els.tabs.forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.adminTab));
    });

    els.productsTable.addEventListener("click", handleProductTableAction);
    els.ordersTable.addEventListener("click", handleOrderTableAction);
    els.categoriesTable.addEventListener("click", handleCategoryTableAction);
    els.sellersTable.addEventListener("click", handleSellerTableAction);
    els.productEditor.addEventListener("submit", handleProductSubmit);
    els.categoryEditor.addEventListener("submit", handleCategorySubmit);
    els.sellerEditor.addEventListener("submit", handleSellerSubmit);
    els.exchangeRatesForm.addEventListener("submit", handleExchangeRatesSubmit);
    els.exchangeRatesForm.addEventListener("input", renderExchangePreview);
    els.productEditor.addEventListener("click", handleEditorClick);
    els.importPreview.addEventListener("click", handleImportPreviewClick);
    els.categoryEditor.addEventListener("click", handleEditorClick);
    els.sellerEditor.addEventListener("click", handleEditorClick);
    els.productEditor.addEventListener("change", handleImagePreview);
    els.sellerEditor.addEventListener("change", handleImagePreview);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setLoginDisabled(true);
    try {
      await window.SmartShopSupabase.signIn(els.emailInput.value.trim(), els.passwordInput.value);
      els.passwordInput.value = "";
      await showAdmin();
      toast("Sesion iniciada.");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginDisabled(false);
    }
  }

  async function handleLogout() {
    await window.SmartShopSupabase.signOut();
    state.catalog = { products: [], categories: [], sellers: [], settings: { exchangeRates: DEFAULT_EXCHANGE_RATES } };
    state.adminUsers = [];
    state.adminUsersError = "";
    state.auditLogs = [];
    state.auditLogsError = "";
    state.orders = [];
    state.ordersError = "";
    showLogin();
    toast("Sesion cerrada.");
  }

  async function handleSendPasswordLink() {
    const email = els.emailInput.value.trim();
    setLoginError("");
    if (!email) {
      setLoginError("Escribe el email para enviar el enlace de contrasena.");
      els.emailInput.focus();
      return;
    }
    setButtonLoading(els.sendPasswordLinkButton, true);
    try {
      await window.SmartShopSupabase.sendPasswordReset(email);
      toast("Enlace enviado. Revisa el correo para crear o recuperar la contrasena.");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setButtonLoading(els.sendPasswordLinkButton, false);
    }
  }

  async function handlePasswordSetup(event) {
    event.preventDefault();
    setPasswordSetupError("");
    const password = els.setupPasswordInput.value;
    const confirmPassword = els.setupPasswordConfirmInput.value;
    if (password.length < 8) {
      setPasswordSetupError("La contrasena debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordSetupError("Las contrasenas no coinciden.");
      return;
    }

    setButtonLoading(els.setupPasswordButton, true);
    try {
      await window.SmartShopSupabase.updatePassword(password);
      els.setupPasswordInput.value = "";
      els.setupPasswordConfirmInput.value = "";
      window.history.replaceState({}, document.title, "/admin");
      const session = await window.SmartShopSupabase.getSession();
      await window.SmartShopSupabase.assertAdmin(session?.user?.id);
      await showAdmin();
      toast("Contrasena guardada.");
    } catch (error) {
      setPasswordSetupError(error.message);
    } finally {
      setButtonLoading(els.setupPasswordButton, false);
    }
  }

  function togglePasswordVisibility(event) {
    const button = event.currentTarget;
    const input = document.querySelector(button.dataset.passwordToggle);
    if (!input) return;
    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Ocultar" : "Mostrar";
    button.setAttribute("aria-label", shouldShow ? "Ocultar contrasena" : "Mostrar contrasena");
    button.setAttribute("aria-pressed", String(shouldShow));
    input.focus();
  }

  async function showAdmin() {
    els.loginView.hidden = true;
    els.passwordSetupView.hidden = true;
    els.adminView.hidden = false;
    await loadAndRenderCatalog();
    await loadAndRenderOrders();
    await loadAndRenderAdminUsers();
    await loadAndRenderAuditLogs();
  }

  function showLogin() {
    els.loginView.hidden = false;
    els.passwordSetupView.hidden = true;
    els.adminView.hidden = true;
    els.emailInput.focus();
  }

  function showPasswordSetup() {
    els.loginView.hidden = true;
    els.passwordSetupView.hidden = false;
    els.adminView.hidden = true;
    els.setupPasswordInput.focus();
  }

  async function loadAndRenderCatalog(forceNotice = false) {
    setLoading(true, "Cargando datos...");
    try {
      state.catalog = await window.SmartShopSupabase.loadAdminCatalog();
      renderAll();
      els.adminSyncStatus.textContent = "Conectado a Supabase";
      if (forceNotice) toast("Datos actualizados.");
    } catch (error) {
      toast(error.message, "error");
      els.adminSyncStatus.textContent = "No se pudo sincronizar";
    } finally {
      setLoading(false);
    }
  }

  function renderAll() {
    renderDashboard();
    renderOrdersTable();
    renderProductsTable();
    renderCategoriesTable();
    renderSellersTable();
    renderSettings();
    renderAdminUsersTable();
    renderAuditLogsTable();
  }

  function renderDashboard() {
    const activeProducts = state.catalog.products.filter((product) => product.active);
    const soldOut = activeProducts.filter((product) => getProductStock(product) <= 0);
    const activeCategories = state.catalog.categories.filter((category) => category.active);
    const activeSellers = state.catalog.sellers.filter((seller) => seller.active);
    const totalStock = activeProducts.reduce((sum, product) => sum + getProductStock(product), 0);
    const openOrders = state.orders.filter((order) => !["delivered", "cancelled"].includes(order.status));

    els.activeProductsCount.textContent = activeProducts.length;
    els.soldOutProductsCount.textContent = soldOut.length;
    els.categoryCount.textContent = activeCategories.length;
    els.sellerCount.textContent = activeSellers.length;
    els.openOrdersCount.textContent = openOrders.length;

    els.dashboardCards.innerHTML = [
      ["Pedidos abiertos", openOrders.length, "Solicitudes pendientes de confirmar o entregar."],
      ["Productos activos", activeProducts.length, "Publicados actualmente en el catalogo."],
      ["Productos sin stock", soldOut.length, "Aparecen como agotados si siguen activos."],
      ["Unidades disponibles", totalStock, "Suma de stock en variantes activas."],
      ["Vendedores activos", activeSellers.length, "Disponibles para WhatsApp en la web."],
      ["Cotizacion", renderExchangeRateText(), "Valor usado para convertir precios desde USD."],
    ]
      .map(
        ([label, value, detail]) => `
          <article class="dashboard-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
            <p>${escapeHtml(detail)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderSettings() {
    const rates = getExchangeRates();
    els.usdToBrlInput.value = rates.usdToBrl;
    els.usdToPygInput.value = rates.usdToPyg;
    renderExchangePreview();
  }

  async function loadAndRenderOrders(showNotice = false) {
    state.ordersError = "";
    try {
      state.orders = await window.SmartShopSupabase.listOrders();
      if (showNotice) toast("Pedidos actualizados.");
    } catch (error) {
      state.orders = [];
      state.ordersError = error.message;
      if (showNotice) toast(error.message, "error");
    }
    renderDashboard();
    renderOrdersTable();
  }

  function renderOrdersTable() {
    if (!els.ordersTable) return;
    if (state.ordersError) {
      els.ordersTable.innerHTML = `
        <div class="admin-notice">
          No se pudo cargar pedidos. ${escapeHtml(state.ordersError)}
        </div>
      `;
      return;
    }

    const rows = state.orders
      .map(
        (order) => `
          <article class="admin-order-row">
            <div class="admin-order-main">
              <div class="admin-product-head">
                <div>
                  <strong>${escapeHtml(order.orderNumber || "")}</strong>
                  <small>
                    ${escapeHtml(order.customerName || "")} | ${escapeHtml(order.customerWhatsapp || "")}
                    ${order.customerWhatsapp ? `<a class="admin-whatsapp-link" href="${getCustomerWhatsAppUrl(order.customerWhatsapp)}" target="_blank" rel="noopener">Abrir WhatsApp</a>` : ""}
                  </small>
                </div>
                <span class="status-pill ${getOrderStatusClass(order.status)}">${escapeHtml(getOrderStatusLabel(order.status))}</span>
              </div>
              <div class="admin-product-meta">
                <span>Total: <strong>${formatPrice(order.totalUsd)}</strong></span>
                <span>Fecha: <strong>${formatDate(order.createdAt)}</strong></span>
                <span>Items: <strong>${Number(order.items?.length || 0)}</strong></span>
              </div>
              <div class="admin-order-items">
                ${(order.items || [])
                  .map(
                    (item) => `
                      <span>
                        ${Number(item.quantity || 0)}x ${escapeHtml(item.productName || "")}${item.variantName ? ` | ${escapeHtml(item.variantName)}` : ""}${item.publicCode ? ` | Codigo ${escapeHtml(item.publicCode)}` : ""}
                      </span>
                    `
                  )
                  .join("")}
              </div>
            </div>
            <div class="admin-order-controls">
              <label class="admin-field">
                <span>Estado</span>
                <select class="admin-input" data-order-status="${escapeHtml(order.id)}">
                  ${renderOrderStatusOptions(order.status)}
                </select>
              </label>
              <label class="admin-field">
                <span>Nota interna</span>
                <input class="admin-input" type="text" value="${escapeHtml(order.adminNotes || "")}" data-order-notes="${escapeHtml(order.id)}">
              </label>
              <button class="admin-button is-primary" type="button" data-order-action="save" data-id="${escapeHtml(order.id)}">Guardar</button>
            </div>
          </article>
        `
      )
      .join("");

    els.ordersTable.innerHTML = `
      <div class="admin-order-list">
        ${rows || `<div class="admin-empty-row">Todavia no hay pedidos.</div>`}
      </div>
    `;
  }

  async function loadAndRenderAdminUsers() {
    state.adminUsersError = "";
    try {
      state.adminUsers = await window.SmartShopSupabase.listAdminUsers();
    } catch (error) {
      state.adminUsers = [];
      state.adminUsersError = error.message;
    }
    renderAdminUsersTable();
  }

  async function loadAndRenderAuditLogs(showNotice = false) {
    state.auditLogsError = "";
    try {
      state.auditLogs = await window.SmartShopSupabase.listAuditLogs();
      if (showNotice) toast("Auditoria actualizada.");
    } catch (error) {
      state.auditLogs = [];
      state.auditLogsError = error.message;
      if (showNotice) toast(error.message, "error");
    }
    renderAuditLogsTable();
  }

  function renderAdminUsersTable() {
    if (!els.adminUsersTable) return;
    if (state.adminUsersError) {
      els.adminUsersTable.innerHTML = `
        <div class="admin-notice">
          No se pudo cargar usuarios admin. Verifica que el secreto SUPABASE_SERVICE_ROLE_KEY este configurado en Cloudflare.
        </div>
      `;
      return;
    }

    const rows = state.adminUsers
      .map(
        (user) => `
          <tr>
            <td><strong>${escapeHtml(user.email || "Sin email")}</strong></td>
            <td>${escapeHtml(user.role || "admin")}</td>
            <td>${user.email_confirmed_at ? "Confirmado" : "Pendiente"}</td>
            <td>${formatDate(user.created_at)}</td>
          </tr>
        `
      )
      .join("");

    els.adminUsersTable.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
            <th>Email</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="4">Todavia no se pudo listar usuarios admin.</td></tr>`}</tbody>
      </table>
    `;
  }

  function renderAuditLogsTable() {
    if (!els.auditLogsTable) return;
    if (state.auditLogsError) {
      els.auditLogsTable.innerHTML = `
        <div class="admin-notice">
          No se pudo cargar auditoria. Ejecuta la migracion audit_logs y verifica SUPABASE_SERVICE_ROLE_KEY en Cloudflare.
        </div>
      `;
      return;
    }

    const rows = state.auditLogs
      .map(
        (log) => `
          <tr>
            <td>${formatDate(log.created_at)}</td>
            <td><strong>${escapeHtml(log.actor_email || "Sistema")}</strong></td>
            <td><span class="status-pill">${escapeHtml(formatAuditAction(log.action))}</span></td>
            <td>${escapeHtml(formatAuditTable(log.table_name))}</td>
            <td>
              <strong>${escapeHtml(getAuditRecordLabel(log))}</strong>
              <small>${escapeHtml(summarizeAuditChange(log))}</small>
            </td>
          </tr>
        `
      )
      .join("");

    els.auditLogsTable.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Accion</th>
            <th>Tabla</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="5">Todavia no hay cambios registrados.</td></tr>`}</tbody>
      </table>
    `;
  }

  function renderExchangePreview() {
    const rates = {
      usdToBrl: Number(els.usdToBrlInput?.value || DEFAULT_EXCHANGE_RATES.usdToBrl),
      usdToPyg: Number(els.usdToPygInput?.value || DEFAULT_EXCHANGE_RATES.usdToPyg),
    };
    if (!els.exchangePreview) return;
    els.exchangePreview.textContent =
      `Asi se vera en el encabezado: Brasil ${formatRateBrl(rates.usdToBrl)} R$ | ` +
      `Paraguay ${formatRatePyg(rates.usdToPyg)} G$. Ejemplo US$ 100 = ` +
      `${formatGuaraniPrice(100 * rates.usdToPyg)} / ${formatRealPrice(100 * rates.usdToBrl)}.`;
  }

  function renderProductsTable() {
    const rows = state.catalog.products
      .map((product) => {
        const primaryImage = getProductImage(product);
        const stock = getProductStock(product);
        const price = getProductPrice(product);
        const variantCodes = getVariantCodes(product);
        const variantSummary = getVariantSummary(product);
        const variants = getProductVariants(product);
        return `
          <article class="admin-product-row ${product.active ? "" : "is-muted"}">
            <img class="admin-product-image" src="${escapeHtml(primaryImage)}" alt="" loading="lazy">
            <div class="admin-product-main">
              <div class="admin-product-head">
                <div>
                  <strong>${escapeHtml(product.name)}</strong>
                  <small>${escapeHtml([product.brand, product.category?.name || "Sin categoria", variantSummary].filter(Boolean).join(" | "))}</small>
                </div>
                <span class="status-pill ${product.active ? "is-active" : "is-inactive"}">${product.active ? "Activo" : "Oculto"}</span>
              </div>
              <div class="admin-product-meta">
                <span>Codigos: <strong>${escapeHtml(variantCodes || product.public_code || "Auto")}</strong></span>
                <span>Desde: <strong>${formatPrice(price)}</strong></span>
                <span>Stock total: <strong>${stock}</strong></span>
              </div>
              <div class="admin-variant-pills">
                ${
                  variants.length
                    ? variants.map((variant) => renderAdminVariantPill(variant, primaryImage)).join("")
                    : `<span class="admin-variant-pill">Sin variantes</span>`
                }
              </div>
            </div>
            <div class="table-actions admin-product-actions">
              <button class="admin-button" type="button" data-product-action="edit" data-id="${product.id}">Editar</button>
              <button class="admin-button" type="button" data-product-action="${product.active ? "hide" : "show"}" data-id="${product.id}">${product.active ? "Ocultar" : "Activar"}</button>
              <button class="admin-button is-danger" type="button" data-product-action="delete" data-id="${product.id}">Eliminar</button>
            </div>
          </article>
        `;
      })
      .join("");

    els.productsTable.innerHTML = `
      <div class="admin-product-list">
        ${rows || `<div class="admin-empty-row">No hay productos cargados.</div>`}
      </div>
    `;
  }

  function renderAdminVariantPill(variant, fallbackImage) {
    const label = formatVariantAdminLabel(variant) || "Default";
    const status = variant.active === false ? "Oculta" : Number(variant.stock || 0) > 0 ? "Activa" : "Sin stock";
    return `
      <span class="admin-variant-pill">
        <img src="${escapeHtml(variant.image_url || fallbackImage || FALLBACK_LOGO)}" alt="" loading="lazy">
        <span>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(variant.sku || "Auto")} | ${formatPrice(variant.price)} | ${Number(variant.stock || 0)} stock | ${status}</small>
        </span>
      </span>
    `;
  }

  function renderCategoriesTable() {
    const rows = state.catalog.categories
      .map(
        (category) => `
          <tr class="${category.active ? "" : "is-muted"}">
            <td><strong>${escapeHtml(category.name)}</strong></td>
            <td>${escapeHtml(category.slug)}</td>
            <td>${Number(category.sort_order || 0)}</td>
            <td><span class="status-pill ${category.active ? "is-active" : "is-inactive"}">${category.active ? "Activa" : "Oculta"}</span></td>
            <td>
              <div class="table-actions">
                <button class="admin-button" type="button" data-category-action="edit" data-id="${category.id}">Editar</button>
                <button class="admin-button" type="button" data-category-action="toggle" data-id="${category.id}">${category.active ? "Ocultar" : "Activar"}</button>
                <button class="admin-button is-danger" type="button" data-category-action="delete" data-id="${category.id}">Eliminar</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");

    els.categoriesTable.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Slug</th>
            <th>Orden</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="5">No hay categorias cargadas.</td></tr>`}</tbody>
      </table>
    `;
  }

  function renderSellersTable() {
    const rows = state.catalog.sellers
      .map(
        (seller) => `
          <tr class="${seller.active ? "" : "is-muted"}">
            <td><img class="admin-thumb" src="${escapeHtml(seller.image_url || FALLBACK_LOGO)}" alt="" loading="lazy"></td>
            <td>
              <strong>${escapeHtml(seller.name)}</strong>
              <small>${escapeHtml(seller.role || "")}</small>
            </td>
            <td>${escapeHtml(seller.whatsapp || "")}</td>
            <td>${Number(seller.sort_order || 0)}</td>
            <td><span class="status-pill ${seller.active ? "is-active" : "is-inactive"}">${seller.active ? "Activo" : "Oculto"}</span></td>
            <td>
              <div class="table-actions">
                <button class="admin-button" type="button" data-seller-action="edit" data-id="${seller.id}">Editar</button>
                <button class="admin-button" type="button" data-seller-action="toggle" data-id="${seller.id}">${seller.active ? "Ocultar" : "Activar"}</button>
                <button class="admin-button is-danger" type="button" data-seller-action="delete" data-id="${seller.id}">Eliminar</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");

    els.sellersTable.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Vendedor</th>
            <th>WhatsApp</th>
            <th>Orden</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="6">No hay vendedores cargados.</td></tr>`}</tbody>
      </table>
    `;
  }

  function openProductEditor(product = null) {
    const image = getProductImage(product);
    const variants = product?.variants?.length ? product.variants : [{ name: "Default", active: true, sort_order: 0 }];
    els.productEditor.hidden = false;
    els.productEditor.innerHTML = `
      <form class="admin-form-grid" data-editor-form="product" data-id="${product?.id || ""}">
        <label class="admin-field">
          <span>Codigo base</span>
          <input class="admin-input" value="${escapeHtml(product?.public_code || "Se asigna al guardar")}" readonly>
        </label>
        <label class="admin-field">
          <span>Nombre</span>
          <input name="name" class="admin-input" value="${escapeHtml(product?.name || "")}" required>
        </label>
        <label class="admin-field">
          <span>Marca</span>
          <input name="brand" class="admin-input" value="${escapeHtml(product?.brand || "")}">
        </label>
        <label class="admin-field">
          <span>Categoria</span>
          <select name="category_id" class="admin-input" required>${renderCategoryOptions(product?.category_id)}</select>
        </label>
        <label class="admin-check">
          <input name="featured" type="checkbox" ${product?.featured ? "checked" : ""}>
          Destacado
        </label>
        <label class="admin-check">
          <input name="active" type="checkbox" ${product?.active === false ? "" : "checked"}>
          Activo
        </label>
        <label class="admin-field is-wide">
          <span>Descripcion</span>
          <textarea name="description" class="admin-textarea">${escapeHtml(product?.description || "")}</textarea>
        </label>
        <section class="variant-editor is-wide" aria-label="Variantes del producto">
          <div class="variant-editor-head">
            <div>
              <strong>Variantes</strong>
              <small>Color, almacenamiento, precio y stock por cada opcion.</small>
            </div>
            <button class="admin-button" type="button" data-editor-action="add-variant">Agregar variante</button>
          </div>
          <div class="variant-editor-list" data-variant-list>
            ${variants.map((variant, index) => renderVariantEditorRow(variant, index)).join("")}
          </div>
        </section>
        <label class="admin-field is-wide">
          <span>Imagen principal</span>
          <input name="image" class="admin-input" type="file" accept="${IMAGE_ACCEPT}" data-preview-target="productImagePreview">
        </label>
        <div class="image-preview is-wide">
          <img id="productImagePreview" src="${escapeHtml(image)}" alt="">
          ${product?.id ? `<button class="admin-button" type="button" data-editor-action="remove-product-image" data-id="${product.id}">Quitar imagen</button>` : ""}
        </div>
        <div class="admin-form-actions is-wide">
          <button class="admin-button is-primary" type="submit">${product ? "Guardar producto" : "Crear producto"}</button>
          <button class="admin-button" type="button" data-editor-action="cancel">Cancelar</button>
        </div>
      </form>
    `;
    els.productEditor.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderVariantEditorRow(variant = {}, index = 0) {
    return `
      <article class="variant-editor-row" data-variant-row>
        <input type="hidden" name="variant_id" value="${escapeHtml(variant.id || "")}">
        <div class="variant-row-head">
          <strong>Variante ${index + 1}</strong>
          <span>Codigo: ${escapeHtml(variant.sku || "Automatico")}</span>
          <button class="admin-button is-danger" type="button" data-editor-action="remove-variant">Quitar</button>
        </div>
        <label class="admin-field">
          <span>Color</span>
          <input name="variant_color" class="admin-input" value="${escapeHtml(variant.color || "")}" placeholder="Azul, Silver, Negro">
        </label>
        <label class="admin-field">
          <span>Almacenamiento</span>
          <input name="variant_storage" class="admin-input" value="${escapeHtml(variant.storage || "")}" placeholder="128 GB, 256 GB">
        </label>
        <label class="admin-field">
          <span>Nombre de variante</span>
          <input name="variant_name" class="admin-input" value="${escapeHtml(variant.name || "")}" placeholder="Se completa automaticamente">
        </label>
        <label class="admin-field">
          <span>Precio USD</span>
          <input name="variant_price" class="admin-input" type="number" min="0" step="0.01" value="${Number(variant.price || 0)}" required>
        </label>
        <label class="admin-field">
          <span>Stock</span>
          <input name="variant_stock" class="admin-input" type="number" min="0" step="1" value="${Number(variant.stock || 0)}" required>
        </label>
        <label class="admin-check">
          <input name="variant_active" type="checkbox" ${variant.active === false ? "" : "checked"}>
          Activa
        </label>
        <label class="admin-field variant-image-field">
          <span>Foto de variante</span>
          <input name="variant_image" class="admin-input" type="file" accept="${IMAGE_ACCEPT}" data-variant-image>
        </label>
        <div class="variant-image-preview">
          <img data-variant-preview src="${escapeHtml(variant.image_url || FALLBACK_LOGO)}" alt="">
          ${variant.image_url ? `<button class="admin-button" type="button" data-editor-action="remove-variant-image" data-id="${escapeHtml(variant.id || "")}">Quitar foto</button>` : ""}
        </div>
      </article>
    `;
  }

  function openCategoryEditor(category = null) {
    els.categoryEditor.hidden = false;
    els.categoryEditor.innerHTML = `
      <form class="admin-form-grid" data-editor-form="category" data-id="${category?.id || ""}">
        <label class="admin-field">
          <span>Nombre</span>
          <input name="name" class="admin-input" value="${escapeHtml(category?.name || "")}" required>
        </label>
        <label class="admin-field">
          <span>Slug</span>
          <input name="slug" class="admin-input" value="${escapeHtml(category?.slug || "")}" placeholder="automatico">
        </label>
        <label class="admin-field">
          <span>Orden</span>
          <input name="sort_order" class="admin-input" type="number" step="1" value="${Number(category?.sort_order || 0)}">
        </label>
        <label class="admin-check">
          <input name="active" type="checkbox" ${category?.active === false ? "" : "checked"}>
          Activa
        </label>
        <div class="admin-form-actions is-wide">
          <button class="admin-button is-primary" type="submit">${category ? "Guardar categoria" : "Crear categoria"}</button>
          <button class="admin-button" type="button" data-editor-action="cancel">Cancelar</button>
        </div>
      </form>
    `;
    els.categoryEditor.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openSellerEditor(seller = null) {
    els.sellerEditor.hidden = false;
    els.sellerEditor.innerHTML = `
      <form class="admin-form-grid" data-editor-form="seller" data-id="${seller?.id || ""}">
        <label class="admin-field">
          <span>Nombre</span>
          <input name="name" class="admin-input" value="${escapeHtml(seller?.name || "")}" required>
        </label>
        <label class="admin-field">
          <span>Rol</span>
          <input name="role" class="admin-input" value="${escapeHtml(seller?.role || "")}">
        </label>
        <label class="admin-field">
          <span>WhatsApp</span>
          <input name="whatsapp" class="admin-input" inputmode="tel" value="${escapeHtml(seller?.whatsapp || "")}" required>
        </label>
        <label class="admin-field">
          <span>Orden</span>
          <input name="sort_order" class="admin-input" type="number" step="1" value="${Number(seller?.sort_order || 0)}">
        </label>
        <label class="admin-check">
          <input name="active" type="checkbox" ${seller?.active === false ? "" : "checked"}>
          Activo
        </label>
        <label class="admin-field is-wide">
          <span>Foto</span>
          <input name="image" class="admin-input" type="file" accept="${IMAGE_ACCEPT}" data-preview-target="sellerImagePreview">
        </label>
        <div class="image-preview is-wide">
          <img id="sellerImagePreview" src="${escapeHtml(seller?.image_url || FALLBACK_LOGO)}" alt="">
        </div>
        <div class="admin-form-actions is-wide">
          <button class="admin-button is-primary" type="submit">${seller ? "Guardar vendedor" : "Crear vendedor"}</button>
          <button class="admin-button" type="button" data-editor-action="cancel">Cancelar</button>
        </div>
      </form>
    `;
    els.sellerEditor.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    const form = event.target.closest("form");
    if (!form) return;
    const submitButton = form.querySelector("[type='submit']");
    setButtonLoading(submitButton, true);
    try {
      const supabase = window.SmartShopSupabase.requireClient();
      const formData = new FormData(form);
      const productId = form.dataset.id;
      const name = String(formData.get("name") || "").trim();
      const categoryId = String(formData.get("category_id") || "").trim();
      const variants = collectVariantPayloads(form);
      if (!name || !categoryId) throw new Error("Nombre y categoria son obligatorios.");
      if (!variants.length) throw new Error("Agrega al menos una variante.");

      const productPayload = {
        name,
        slug: window.SmartShopSupabase.toSlug(name),
        brand: String(formData.get("brand") || "").trim(),
        category_id: categoryId,
        description: String(formData.get("description") || "").trim(),
        featured: formData.get("featured") === "on",
        active: formData.get("active") === "on",
      };

      const savedProduct = productId
        ? await updateRow("products", productId, productPayload)
        : await insertRow("products", productPayload);

      const deletedVariantIds = getDeletedVariantIds(form);
      for (const variantId of deletedVariantIds) {
        await deleteRow("product_variants", variantId);
      }

      for (const [index, variant] of variants.entries()) {
        const variantPayload = {
          product_id: savedProduct.id,
          name: variant.name,
          color: variant.color,
          storage: variant.storage,
          price: variant.price,
          stock: variant.stock,
          active: variant.active,
          sort_order: index,
        };

        if (variant.id) {
          const savedVariant = await updateRow("product_variants", variant.id, variantPayload);
          await uploadVariantImageIfNeeded(savedProduct, savedVariant, variant.imageFile);
        } else {
          const savedVariant = await insertRow("product_variants", variantPayload);
          await uploadVariantImageIfNeeded(savedProduct, savedVariant, variant.imageFile);
        }
      }

      const imageFile = formData.get("image");
      if (imageFile?.size) {
        const uploaded = await window.SmartShopSupabase.uploadImage(
          imageFile,
          window.SmartShopSupabase.config.productBucket,
          `products/${savedProduct.id}`
        );
        await supabase.from("product_images").update({ is_primary: false }).eq("product_id", savedProduct.id);
        await insertRow("product_images", {
          product_id: savedProduct.id,
          url: uploaded.url,
          sort_order: 0,
          is_primary: true,
        });
      }

      closeEditors();
      await loadAndRenderCatalog();
      toast(productId ? "Producto actualizado." : "Producto creado correctamente.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(submitButton, false);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    const form = event.target.closest("form");
    if (!form) return;
    const submitButton = form.querySelector("[type='submit']");
    setButtonLoading(submitButton, true);
    try {
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      if (!name) throw new Error("El nombre de la categoria es obligatorio.");
      const payload = {
        name,
        slug: nullableString(formData.get("slug")) || window.SmartShopSupabase.toSlug(name),
        sort_order: Number(formData.get("sort_order") || 0),
        active: formData.get("active") === "on",
      };
      if (form.dataset.id) {
        await updateRow("categories", form.dataset.id, payload);
      } else {
        await insertRow("categories", payload);
      }
      closeEditors();
      await loadAndRenderCatalog();
      toast(form.dataset.id ? "Categoria actualizada." : "Categoria creada.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(submitButton, false);
    }
  }

  async function handleSellerSubmit(event) {
    event.preventDefault();
    const form = event.target.closest("form");
    if (!form) return;
    const submitButton = form.querySelector("[type='submit']");
    setButtonLoading(submitButton, true);
    try {
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const whatsapp = String(formData.get("whatsapp") || "").replace(/\D/g, "");
      if (!name || !whatsapp) throw new Error("Nombre y WhatsApp son obligatorios.");
      if (whatsapp.length < 8 || whatsapp.length > 15) throw new Error("Revisa el numero de WhatsApp.");

      const payload = {
        name,
        whatsapp,
        role: String(formData.get("role") || "").trim(),
        sort_order: Number(formData.get("sort_order") || 0),
        active: formData.get("active") === "on",
      };

      const imageFile = formData.get("image");
      if (imageFile?.size) {
        const sellerId = form.dataset.id || "nuevo";
        const uploaded = await window.SmartShopSupabase.uploadImage(
          imageFile,
          window.SmartShopSupabase.config.sellerBucket,
          `sellers/${sellerId}`
        );
        payload.image_url = uploaded.url;
      }

      if (form.dataset.id) {
        await updateRow("sellers", form.dataset.id, payload);
      } else {
        await insertRow("sellers", payload);
      }
      closeEditors();
      await loadAndRenderCatalog();
      toast(form.dataset.id ? "Vendedor actualizado." : "Vendedor creado.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(submitButton, false);
    }
  }

  async function handleExchangeRatesSubmit(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector("[type='submit']");
    setButtonLoading(submitButton, true);
    try {
      const usdToBrl = Number(els.usdToBrlInput.value || 0);
      const usdToPyg = Number(els.usdToPygInput.value || 0);
      if (!Number.isFinite(usdToBrl) || usdToBrl <= 0) throw new Error("La cotizacion en reales debe ser mayor a cero.");
      if (!Number.isFinite(usdToPyg) || usdToPyg <= 0) throw new Error("La cotizacion en guaranies debe ser mayor a cero.");

      await upsertStoreSetting("exchange_rates", {
        baseCurrency: "USD",
        usdToBrl,
        usdToPyg,
      });
      await loadAndRenderCatalog();
      setTab("settingsPanel");
      toast("Cotizaciones actualizadas.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(submitButton, false);
    }
  }

  async function handleCreateAdminUser(event) {
    event.preventDefault();
    const email = els.newAdminEmailInput.value.trim();
    const password = els.newAdminPasswordInput.value;
    if (!email) {
      toast("Escribe el email del nuevo usuario.", "error");
      return;
    }
    if (password.length < 8) {
      toast("La contrasena temporal debe tener al menos 8 caracteres.", "error");
      return;
    }

    setButtonLoading(els.createAdminUserButton, true);
    try {
      const user = await window.SmartShopSupabase.createAdminUser({ email, password });
      els.newAdminEmailInput.value = "";
      els.newAdminPasswordInput.value = "";
      await loadAndRenderAdminUsers();
      await loadAndRenderAuditLogs();
      toast(user?.existing ? "Usuario existente actualizado como admin." : "Usuario admin creado correctamente.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(els.createAdminUserButton, false);
    }
  }

  async function handleProductTableAction(event) {
    const button = event.target.closest("[data-product-action]");
    if (!button) return;
    const product = state.catalog.products.find((item) => item.id === button.dataset.id);
    if (!product) return;

    if (button.dataset.productAction === "edit") {
      openProductEditor(product);
      return;
    }

    try {
      if (button.dataset.productAction === "hide" || button.dataset.productAction === "show") {
        await updateRow("products", product.id, { active: button.dataset.productAction === "show" });
        toast(button.dataset.productAction === "show" ? "Producto activado." : "Producto ocultado.");
      }
      if (button.dataset.productAction === "delete") {
        if (!confirm(`Seguro que quieres eliminar ${product.name}?`)) return;
        await deleteRow("products", product.id);
        toast("Producto eliminado.");
      }
      await loadAndRenderCatalog();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function handleOrderTableAction(event) {
    const button = event.target.closest("[data-order-action]");
    if (!button) return;
    const orderId = button.dataset.id;
    const statusInput = els.ordersTable.querySelector(`[data-order-status="${cssEscape(orderId)}"]`);
    const notesInput = els.ordersTable.querySelector(`[data-order-notes="${cssEscape(orderId)}"]`);
    setButtonLoading(button, true);
    try {
      await window.SmartShopSupabase.updateOrderStatus(orderId, {
        status: statusInput?.value || "new",
        admin_notes: notesInput?.value || "",
      });
      await loadAndRenderOrders();
      await loadAndRenderAuditLogs();
      toast("Pedido actualizado.");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function handleCategoryTableAction(event) {
    const button = event.target.closest("[data-category-action]");
    if (!button) return;
    const category = state.catalog.categories.find((item) => item.id === button.dataset.id);
    if (!category) return;

    if (button.dataset.categoryAction === "edit") {
      openCategoryEditor(category);
      return;
    }

    try {
      if (button.dataset.categoryAction === "toggle") {
        await updateRow("categories", category.id, { active: !category.active });
        toast(category.active ? "Categoria ocultada." : "Categoria activada.");
      }
      if (button.dataset.categoryAction === "delete") {
        if (!confirm(`Seguro que quieres eliminar la categoria ${category.name}?`)) return;
        await deleteRow("categories", category.id);
        toast("Categoria eliminada.");
      }
      await loadAndRenderCatalog();
    } catch (error) {
      toast(readableDatabaseError(error), "error");
    }
  }

  async function handleSellerTableAction(event) {
    const button = event.target.closest("[data-seller-action]");
    if (!button) return;
    const seller = state.catalog.sellers.find((item) => item.id === button.dataset.id);
    if (!seller) return;

    if (button.dataset.sellerAction === "edit") {
      openSellerEditor(seller);
      return;
    }

    try {
      if (button.dataset.sellerAction === "toggle") {
        await updateRow("sellers", seller.id, { active: !seller.active });
        toast(seller.active ? "Vendedor ocultado." : "Vendedor activado.");
      }
      if (button.dataset.sellerAction === "delete") {
        if (!confirm(`Seguro que quieres eliminar a ${seller.name}?`)) return;
        await deleteRow("sellers", seller.id);
        toast("Vendedor eliminado.");
      }
      await loadAndRenderCatalog();
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function handleEditorClick(event) {
    const button = event.target.closest("[data-editor-action]");
    if (!button) return;
    if (button.dataset.editorAction === "cancel") {
      closeEditors();
    }
    if (button.dataset.editorAction === "add-variant") {
      const list = els.productEditor.querySelector("[data-variant-list]");
      if (list) {
        list.insertAdjacentHTML("beforeend", renderVariantEditorRow({}, list.querySelectorAll("[data-variant-row]").length));
      }
    }
    if (button.dataset.editorAction === "remove-variant") {
      const row = button.closest("[data-variant-row]");
      const list = button.closest("[data-variant-list]");
      const activeRows = list ? [...list.querySelectorAll("[data-variant-row]:not(.is-deleted)")] : [];
      if (activeRows.length <= 1) {
        toast("El producto debe conservar al menos una variante.", "error");
        return;
      }
      const variantId = row?.querySelector("[name='variant_id']")?.value;
      if (variantId) {
        row.insertAdjacentHTML("afterend", `<input type="hidden" name="deleted_variant_id" value="${escapeHtml(variantId)}">`);
      }
      row?.remove();
    }
    if (button.dataset.editorAction === "remove-variant-image") {
      try {
        await updateRow("product_variants", button.dataset.id, { image_url: null });
        await loadAndRenderCatalog();
        const productId = els.productEditor.querySelector("[data-editor-form='product']")?.dataset.id;
        openProductEditor(state.catalog.products.find((item) => item.id === productId));
        toast("Foto quitada de la variante.");
      } catch (error) {
        toast(error.message, "error");
      }
    }
    if (button.dataset.editorAction === "remove-product-image") {
      try {
        await window.SmartShopSupabase.requireClient()
          .from("product_images")
          .delete()
          .eq("product_id", button.dataset.id)
          .eq("is_primary", true);
        await loadAndRenderCatalog();
        openProductEditor(state.catalog.products.find((item) => item.id === button.dataset.id));
        toast("Imagen quitada del producto.");
      } catch (error) {
        toast(error.message, "error");
      }
    }
  }

  function downloadImportTemplate() {
    try {
      ensureXlsxAvailable();
      const worksheet = window.XLSX.utils.json_to_sheet(TEMPLATE_ROWS, {
        header: IMPORT_COLUMNS.map(([key]) => key),
      });
      window.XLSX.utils.sheet_add_aoa(worksheet, [IMPORT_COLUMNS.map(([, label]) => label)], { origin: "A1" });
      worksheet["!cols"] = IMPORT_COLUMNS.map(() => ({ wch: 24 }));
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
      window.XLSX.writeFile(workbook, "formato-carga-productos-smartshop.xlsx");
      toast("Formato de carga descargado.");
    } catch (error) {
      toast(error.message, "error");
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      ensureXlsxAvailable();
      const rows = await readWorkbookRows(file);
      const preview = buildImportPreview(rows);
      state.pendingImport = preview;
      renderImportPreview(preview);
      setTab("productsPanel");
      closeEditors();
      els.importPreview.hidden = false;
      els.importPreview.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      state.pendingImport = null;
      els.importPreview.hidden = true;
      els.importPreview.innerHTML = "";
      toast(error.message, "error");
    }
  }

  async function readWorkbookRows(file) {
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) throw new Error("El archivo no tiene hojas.");
    const rows = window.XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false });
    if (!rows.length) throw new Error("El Excel no tiene productos para importar.");
    return rows.map(normalizeImportRow).filter((row) => Object.values(row.raw).some(Boolean));
  }

  function buildImportPreview(rows) {
    const productIndex = buildProductIndex();
    const categoryIndex = buildCategoryIndex();
    const entries = rows.map((row, index) => {
      const errors = validateImportRow(row);
      const categoryKey = normalizeKey(row.category);
      const variantName = row.variant || "Default";
      const lookupKey = makeProductLookupKey(row.name, row.category, row.brand);
      const existingProduct = productIndex.get(lookupKey);
      const existingCategory = categoryIndex.get(categoryKey);
      return {
        ...row,
        rowNumber: index + 2,
        variant: variantName,
        existingProduct,
        existingCategory,
        action: existingProduct ? "update" : "create",
        categoryAction: existingCategory ? "use" : "create",
        errors,
      };
    });

    return {
      entries,
      validEntries: entries.filter((entry) => entry.errors.length === 0),
      errorEntries: entries.filter((entry) => entry.errors.length > 0),
      createCount: entries.filter((entry) => entry.errors.length === 0 && entry.action === "create").length,
      updateCount: entries.filter((entry) => entry.errors.length === 0 && entry.action === "update").length,
      newCategoryCount: new Set(
        entries
          .filter((entry) => entry.errors.length === 0 && entry.categoryAction === "create")
          .map((entry) => normalizeKey(entry.category))
      ).size,
    };
  }

  function renderImportPreview(preview) {
    const canImport = preview.validEntries.length > 0 && preview.errorEntries.length === 0;
    const errorList = preview.errorEntries
      .slice(0, 8)
      .map(
        (entry) => `
          <li>Fila ${entry.rowNumber}: ${escapeHtml(entry.errors.join(", "))}</li>
        `
      )
      .join("");
    const sampleRows = preview.entries
      .slice(0, 6)
      .map(
        (entry) => `
          <tr class="${entry.errors.length ? "is-muted" : ""}">
            <td>${entry.rowNumber}</td>
            <td><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(entry.brand || "")}</small></td>
            <td>${escapeHtml(entry.category)}</td>
            <td>${escapeHtml(entry.variant)}</td>
            <td>${formatPrice(entry.price)}</td>
            <td>${entry.stock}</td>
            <td>${entry.errors.length ? "Error" : entry.action === "update" ? "Actualizar" : "Crear"}</td>
          </tr>
        `
      )
      .join("");

    els.importPreview.innerHTML = `
      <div class="section-title-row">
        <div>
          <p class="panel-kicker">Importacion Excel</p>
          <h2>Vista previa</h2>
        </div>
        <span>${preview.entries.length} filas detectadas</span>
      </div>
      <div class="import-summary">
        <article><strong>${preview.createCount}</strong><span>Nuevos</span></article>
        <article><strong>${preview.updateCount}</strong><span>Actualizaciones</span></article>
        <article><strong>${preview.newCategoryCount}</strong><span>Categorias nuevas</span></article>
        <article class="${preview.errorEntries.length ? "is-danger" : ""}"><strong>${preview.errorEntries.length}</strong><span>Errores</span></article>
      </div>
      ${
        errorList
          ? `<div class="import-errors"><strong>Corrige antes de importar:</strong><ul>${errorList}</ul></div>`
          : `<p class="admin-notice">El codigo publico y el SKU se asignan automaticamente desde Supabase. Las imagenes se cargan luego desde el panel.</p>`
      }
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Fila</th>
              <th>Producto</th>
              <th>Categoria</th>
              <th>Variante</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>${sampleRows}</tbody>
        </table>
      </div>
      <div class="admin-form-actions">
        <button class="admin-button is-primary" type="button" data-import-action="confirm" ${canImport ? "" : "disabled"}>Confirmar importacion</button>
        <button class="admin-button" type="button" data-import-action="cancel">Cancelar</button>
      </div>
    `;
  }

  async function handleImportPreviewClick(event) {
    const button = event.target.closest("[data-import-action]");
    if (!button) return;
    if (button.dataset.importAction === "cancel") {
      state.pendingImport = null;
      els.importPreview.hidden = true;
      els.importPreview.innerHTML = "";
      return;
    }
    if (button.dataset.importAction === "confirm") {
      await confirmImport(button);
    }
  }

  async function confirmImport(button) {
    if (!state.pendingImport?.validEntries?.length) return;
    setButtonLoading(button, true);
    try {
      const result = await importProducts(state.pendingImport.validEntries);
      state.pendingImport = null;
      els.importPreview.hidden = true;
      els.importPreview.innerHTML = "";
      await loadAndRenderCatalog();
      toast(`Importacion lista: ${result.created} creados, ${result.updated} actualizados.`);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function importProducts(entries) {
    const categoryMap = buildCategoryIndex();
    const productMap = buildProductIndex();
    const result = { created: 0, updated: 0 };

    for (const entry of entries) {
      const categoryKey = normalizeKey(entry.category);
      let category = categoryMap.get(categoryKey);
      if (!category) {
        category = await insertRow("categories", {
          name: entry.category,
          slug: window.SmartShopSupabase.toSlug(entry.category),
          active: true,
          sort_order: state.catalog.categories.length + categoryMap.size,
        });
        categoryMap.set(categoryKey, category);
      }

      const lookupKey = makeProductLookupKey(entry.name, entry.category, entry.brand);
      let product = productMap.get(lookupKey);
      const existingVariant = findMatchingVariant(product, entry);
      const productPayload = {
        name: entry.name,
        slug: window.SmartShopSupabase.toSlug(entry.name),
        brand: entry.brand,
        category_id: category.id,
        description: entry.description,
        featured: entry.featured,
        active: entry.active,
      };

      if (product) {
        product = await updateRow("products", product.id, productPayload);
        const savedVariant = await upsertImportedVariant(product, entry, existingVariant);
        productMap.set(lookupKey, {
          ...product,
          category,
          variants: upsertVariantInList(productMap.get(lookupKey)?.variants || [], savedVariant),
        });
        result.updated += 1;
      } else {
        product = await insertRow("products", productPayload);
        const savedVariant = await upsertImportedVariant(product, entry);
        productMap.set(lookupKey, {
          ...product,
          category,
          variants: [savedVariant],
        });
        result.created += 1;
      }
    }

    return result;
  }

  async function upsertImportedVariant(product, entry, variant = null) {
    const payload = {
      product_id: product.id,
      name: entry.variant || buildVariantName(entry) || "Default",
      color: entry.color || null,
      storage: entry.storage || null,
      price: entry.price,
      stock: entry.stock,
      active: entry.active,
    };
    if (variant?.id) {
      return updateRow("product_variants", variant.id, payload);
    }
    return insertRow("product_variants", payload);
  }

  function collectVariantPayloads(form) {
    return [...form.querySelectorAll("[data-variant-row]:not(.is-deleted)")]
      .map((row) => {
        const color = cleanText(row.querySelector("[name='variant_color']")?.value);
        const storage = cleanText(row.querySelector("[name='variant_storage']")?.value);
        const manualName = cleanText(row.querySelector("[name='variant_name']")?.value);
        const price = Number(row.querySelector("[name='variant_price']")?.value || 0);
        const stock = Number(row.querySelector("[name='variant_stock']")?.value || 0);
        if (!Number.isFinite(price) || price < 0) throw new Error("El precio de variante no puede ser negativo.");
        if (!Number.isInteger(stock) || stock < 0) throw new Error("El stock de variante debe ser un numero entero positivo.");
        return {
          id: cleanText(row.querySelector("[name='variant_id']")?.value),
          name: manualName || buildVariantName({ color, storage }) || "Default",
          color: color || null,
          storage: storage || null,
          price,
          stock,
          active: row.querySelector("[name='variant_active']")?.checked !== false,
          imageFile: row.querySelector("[name='variant_image']")?.files?.[0] || null,
        };
      })
      .filter((variant) => variant.name || variant.color || variant.storage);
  }

  async function uploadVariantImageIfNeeded(product, variant, imageFile) {
    if (!imageFile?.size) return variant;
    const uploaded = await window.SmartShopSupabase.uploadImage(
      imageFile,
      window.SmartShopSupabase.config.productBucket,
      `products/${product.id}/variants/${variant.id}`
    );
    return updateRow("product_variants", variant.id, { image_url: uploaded.url });
  }

  function getDeletedVariantIds(form) {
    return [...form.querySelectorAll("[name='deleted_variant_id']")]
      .map((input) => cleanText(input.value))
      .filter(Boolean);
  }

  function buildVariantName(variant) {
    return [variant.storage, variant.color].map(cleanText).filter(Boolean).join(" / ");
  }

  async function upsertStoreSetting(key, value) {
    const { data, error } = await window.SmartShopSupabase.requireClient()
      .from("store_settings")
      .upsert({ key, value }, { onConflict: "key" })
      .select()
      .single();
    if (error) throw new Error(readableDatabaseError(error));
    return data;
  }

  function handleImagePreview(event) {
    const input = event.target.closest("[data-preview-target]");
    const variantInput = event.target.closest("[data-variant-image]");
    if (!input?.files?.[0] && !variantInput?.files?.[0]) return;
    const preview = input
      ? document.querySelector(`#${input.dataset.previewTarget}`)
      : variantInput.closest("[data-variant-row]")?.querySelector("[data-variant-preview]");
    const file = input?.files?.[0] || variantInput?.files?.[0];
    if (preview) {
      preview.src = URL.createObjectURL(file);
      preview.onload = () => URL.revokeObjectURL(preview.src);
    }
  }

  async function insertRow(table, payload) {
    const { data, error } = await window.SmartShopSupabase.requireClient()
      .from(table)
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(readableDatabaseError(error));
    return data;
  }

  async function updateRow(table, id, payload) {
    const { data, error } = await window.SmartShopSupabase.requireClient()
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(readableDatabaseError(error));
    return data;
  }

  async function deleteRow(table, id) {
    const { error } = await window.SmartShopSupabase.requireClient().from(table).delete().eq("id", id);
    if (error) throw new Error(readableDatabaseError(error));
  }

  function setTab(tabId) {
    els.tabs.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.adminTab === tabId);
    });
    els.panels.forEach((panel) => {
      panel.hidden = panel.id !== tabId;
    });
    closeEditors();
  }

  function isPasswordSetupFlow() {
    const params = getAuthParams();
    const type = String(params.get("type") || "").toLowerCase();
    return ["invite", "recovery"].includes(type);
  }

  function getAuthParams() {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    hash.forEach((value, key) => params.set(key, value));
    return params;
  }

  function closeEditors() {
    els.productEditor.hidden = true;
    els.categoryEditor.hidden = true;
    els.sellerEditor.hidden = true;
    els.productEditor.innerHTML = "";
    els.categoryEditor.innerHTML = "";
    els.sellerEditor.innerHTML = "";
  }

  function renderCategoryOptions(selectedId) {
    return state.catalog.categories
      .map(
        (category) => `
          <option value="${category.id}" ${category.id === selectedId ? "selected" : ""}>
            ${escapeHtml(category.name)}${category.active ? "" : " (oculta)"}
          </option>
        `
      )
      .join("");
  }

  function formatAuditAction(action) {
    const labels = {
      INSERT: "Creacion",
      UPDATE: "Edicion",
      DELETE: "Eliminacion",
    };
    return labels[action] || action || "Cambio";
  }

  function formatAuditTable(tableName) {
    const labels = {
      "auth.users": "Usuarios",
      profiles: "Permisos",
      categories: "Categorias",
      products: "Productos",
      product_variants: "Variantes",
      product_images: "Imagenes",
      orders: "Pedidos",
      order_items: "Items de pedido",
      sellers: "Vendedores",
      store_settings: "Cotizaciones",
    };
    return labels[tableName] || tableName || "Registro";
  }

  function renderOrderStatusOptions(selectedStatus) {
    return Object.entries(getOrderStatusLabels())
      .map(([status, label]) => `<option value="${status}" ${status === selectedStatus ? "selected" : ""}>${label}</option>`)
      .join("");
  }

  function getOrderStatusLabels() {
    return {
      new: "Recibido",
      confirmed: "Confirmado",
      preparing: "En preparacion",
      ready: "Listo para retirar",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
  }

  function getOrderStatusLabel(status) {
    return getOrderStatusLabels()[status] || getOrderStatusLabels().new;
  }

  function getOrderStatusClass(status) {
    if (status === "cancelled") return "is-sold-out";
    if (status === "delivered" || status === "ready") return "is-active";
    if (status === "preparing" || status === "confirmed") return "is-inactive";
    return "";
  }

  function getAuditRecordLabel(log) {
    const data = log.new_data || log.old_data || {};
    return data.name || data.email || data.key || data.public_code || log.record_id || "Registro";
  }

  function summarizeAuditChange(log) {
    const data = log.new_data || log.old_data || {};
    if (log.table_name === "products") {
      return [data.public_code ? `Codigo ${data.public_code}` : "", data.brand || ""].filter(Boolean).join(" | ");
    }
    if (log.table_name === "product_variants") {
      return [data.name || "Variante", data.price ? formatPrice(data.price) : "", data.stock != null ? `Stock ${data.stock}` : ""]
        .filter(Boolean)
        .join(" | ");
    }
    if (log.table_name === "sellers") {
      return data.whatsapp ? `WhatsApp ${data.whatsapp}` : "";
    }
    if (log.table_name === "profiles") {
      return data.role ? `Rol ${data.role}` : "";
    }
    if (log.table_name === "store_settings") {
      return "Cotizacion actualizada";
    }
    if (log.table_name === "orders") {
      return [data.order_number || "Pedido", data.status ? `Estado ${getOrderStatusLabel(data.status)}` : ""]
        .filter(Boolean)
        .join(" | ");
    }
    return log.record_id || "";
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("es-PY", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function getProductImage(product) {
    if (!product) return FALLBACK_LOGO;
    const images = [...(product.images || [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    return images.find((image) => image.is_primary)?.url || images[0]?.url || FALLBACK_LOGO;
  }

  function getProductStock(product) {
    return (product.variants || [])
      .filter((variant) => variant.active !== false)
      .reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  }

  function getProductPrice(product) {
    const prices = (product.variants || [])
      .filter((variant) => variant.active !== false)
      .map((variant) => Number(variant.price || 0));
    return prices.length ? Math.min(...prices) : 0;
  }

  function getProductVariants(product) {
    return [...(product.variants || [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function getVariantLabel(product) {
    const variant = product.variants?.find((item) => item.active !== false) || product.variants?.[0];
    const label = formatVariantAdminLabel(variant);
    return label === "Default" ? "" : label;
  }

  function getVariantCodes(product) {
    const codes = (product.variants || [])
      .filter((variant) => variant.active !== false)
      .map((variant) => variant.sku)
      .filter(Boolean);
    if (!codes.length) return "";
    return codes.slice(0, 3).join(", ") + (codes.length > 3 ? "..." : "");
  }

  function getVariantSummary(product) {
    const activeVariants = (product.variants || []).filter((variant) => variant.active !== false);
    if (activeVariants.length > 1) return `${activeVariants.length} variantes`;
    return getVariantLabel(product);
  }

  function formatVariantAdminLabel(variant) {
    if (!variant) return "";
    return [variant.storage, variant.color].map(cleanText).filter(Boolean).join(" / ") || variant.name || "";
  }

  function normalizeImportRow(row) {
    const normalized = { raw: row };
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = normalizeHeader(key);
      if (["nombre", "nombreDelProducto", "producto", "name"].includes(normalizedKey)) normalized.name = cleanText(value);
      if (["marca", "brand"].includes(normalizedKey)) normalized.brand = cleanText(value);
      if (["categoria", "category"].includes(normalizedKey)) normalized.category = cleanText(value);
      if (["variante", "varianteOCapacidad", "capacidad", "variant"].includes(normalizedKey)) {
        normalized.variant = cleanText(value);
      }
      if (["color", "cor"].includes(normalizedKey)) normalized.color = cleanText(value);
      if (["almacenamiento", "storage"].includes(normalizedKey)) normalized.storage = cleanText(value);
      if (["precio", "precioUsd", "precioGs", "price"].includes(normalizedKey)) normalized.price = parseImportNumber(value);
      if (["stock", "cantidad", "unidades"].includes(normalizedKey)) normalized.stock = parseImportNumber(value);
      if (["descripcion", "description"].includes(normalizedKey)) normalized.description = cleanText(value);
      if (["destacado", "destacadoSiNo", "featured"].includes(normalizedKey)) {
        normalized.featured = parseImportBoolean(value, false);
      }
      if (["activo", "activoSiNo", "active"].includes(normalizedKey)) normalized.active = parseImportBoolean(value, true);
    });

    return {
      raw: normalized.raw,
      name: normalized.name || "",
      brand: normalized.brand || "",
      category: normalized.category || "",
      variant: normalized.variant || buildVariantName(normalized) || "Default",
      color: normalized.color || "",
      storage: normalized.storage || "",
      price: Number.isFinite(normalized.price) ? normalized.price : NaN,
      stock: Number.isFinite(normalized.stock) ? normalized.stock : NaN,
      description: normalized.description || "",
      featured: Boolean(normalized.featured),
      active: normalized.active !== false,
    };
  }

  function validateImportRow(row) {
    const errors = [];
    if (!row.name) errors.push("nombre requerido");
    if (!row.category) errors.push("categoria requerida");
    if (!Number.isFinite(row.price) || row.price < 0) errors.push("precio invalido");
    if (!Number.isFinite(row.stock) || row.stock < 0 || !Number.isInteger(row.stock)) errors.push("stock invalido");
    return errors;
  }

  function buildProductIndex() {
    return new Map(
      state.catalog.products.map((product) => [
        makeProductLookupKey(product.name, product.category?.name || "", product.brand || ""),
        product,
      ])
    );
  }

  function findMatchingVariant(product, entry) {
    if (!product?.variants?.length) return null;
    const wanted = normalizeVariantKey(entry);
    return product.variants.find((variant) => normalizeVariantKey(variant) === wanted) || null;
  }

  function normalizeVariantKey(variant) {
    return [variant.storage || "", variant.color || "", variant.name || variant.variant || "Default"].map(normalizeKey).join("|");
  }

  function upsertVariantInList(variants, savedVariant) {
    const exists = variants.some((variant) => variant.id && variant.id === savedVariant.id);
    if (exists) {
      return variants.map((variant) => (variant.id === savedVariant.id ? savedVariant : variant));
    }
    return [...variants, savedVariant];
  }

  function buildCategoryIndex() {
    return new Map(state.catalog.categories.map((category) => [normalizeKey(category.name), category]));
  }

  function makeProductLookupKey(name, category, brand) {
    return [name, category, brand || ""].map(normalizeKey).join("|");
  }

  function normalizeHeader(value) {
    return normalizeKey(value).replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function cleanText(value) {
    return String(value ?? "").trim();
  }

  function parseImportNumber(value) {
    if (typeof value === "number") return value;
    const text = String(value ?? "")
      .replace(/gs\.?/gi, "")
      .replace(/us\$|usd/gi, "")
      .replace(/r\$|rs\.?/gi, "")
      .replace(/[^\d,.-]/g, "")
      .trim();
    if (!text) return NaN;
    const normalized = text.includes(",") && text.includes(".")
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(",", ".");
    return Number(normalized);
  }

  function parseImportBoolean(value, fallback) {
    const text = normalizeKey(value);
    if (!text) return fallback;
    return ["si", "s", "yes", "y", "true", "1", "activo", "activa"].includes(text);
  }

  function ensureXlsxAvailable() {
    if (!window.XLSX) {
      throw new Error("No se pudo cargar el lector Excel. Revisa la conexion e intenta de nuevo.");
    }
  }

  function setLoading(isLoading, message = "") {
    state.loading = isLoading;
    if (message) els.adminSyncStatus.textContent = message;
    document.querySelectorAll(".admin-button").forEach((button) => {
      if (button.id !== "logoutButton") button.disabled = isLoading;
    });
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = isLoading ? "Guardando..." : button.dataset.originalText;
  }

  function setLoginDisabled(disabled) {
    els.emailInput.disabled = disabled;
    els.passwordInput.disabled = disabled;
    els.passwordToggles.forEach((button) => {
      button.disabled = disabled;
    });
    els.loginButton.disabled = disabled;
    els.sendPasswordLinkButton.disabled = disabled;
  }

  function setLoginError(message) {
    els.loginError.textContent = message;
  }

  function setPasswordSetupError(message) {
    els.passwordSetupError.textContent = message;
  }

  function nullableString(value) {
    const text = String(value || "").trim();
    return text || null;
  }

  function formatPrice(value) {
    return formatUsdPrice(value);
  }

  function getCustomerWhatsAppUrl(phone) {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    return `https://wa.me/${cleanPhone}`;
  }

  function getExchangeRates() {
    const rates = state.catalog.settings?.exchangeRates || {};
    const usdToBrl = Number(rates.usdToBrl ?? rates.usd_to_brl ?? DEFAULT_EXCHANGE_RATES.usdToBrl);
    const usdToPyg = Number(rates.usdToPyg ?? rates.usd_to_pyg ?? DEFAULT_EXCHANGE_RATES.usdToPyg);
    return {
      usdToBrl: Number.isFinite(usdToBrl) && usdToBrl > 0 ? usdToBrl : DEFAULT_EXCHANGE_RATES.usdToBrl,
      usdToPyg: Number.isFinite(usdToPyg) && usdToPyg > 0 ? usdToPyg : DEFAULT_EXCHANGE_RATES.usdToPyg,
    };
  }

  function renderExchangeRateText() {
    const rates = getExchangeRates();
    return `BR ${formatRateBrl(rates.usdToBrl)} R$ | PY ${formatRatePyg(rates.usdToPyg)} G$`;
  }

  function formatUsdPrice(value) {
    const amount = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(
      Number(value) || 0
    );
    return `US$ ${amount}`;
  }

  function formatGuaraniPrice(value) {
    const amount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(Number(value) || 0);
    return `Gs. ${amount}`;
  }

  function formatRealPrice(value) {
    const amount = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number(value) || 0
    );
    return `R$ ${amount}`;
  }

  function formatRateBrl(value) {
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Number(value) || 0
    );
  }

  function formatRatePyg(value) {
    return new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  function readableDatabaseError(error) {
    const message = String(error?.message || error || "");
    if (message.includes("schema cache") && message.includes("product_variants")) {
      return "Falta actualizar Supabase para usar variantes completas. Ejecuta las migraciones 20260826103000_variant_public_codes.sql y 20260827100000_variant_images.sql en el SQL Editor y vuelve a intentar.";
    }
    if (message.includes("duplicate key") || message.includes("already exists")) {
      return "Ya existe un registro con ese codigo o slug.";
    }
    if (message.includes("violates foreign key")) {
      return "No se puede eliminar porque todavia esta relacionado con otros datos.";
    }
    if (message.includes("row-level security")) {
      return "No tienes permisos para realizar esta accion.";
    }
    return message || "No se pudo completar la accion.";
  }

  function toast(message, type = "success") {
    const node = document.createElement("div");
    node.className = `toast is-${type}`;
    node.textContent = message;
    els.toastRegion.appendChild(node);
    window.setTimeout(() => node.remove(), 4200);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return window.CSS.escape(String(value || ""));
    return String(value || "").replace(/"/g, '\\"');
  }
})();
