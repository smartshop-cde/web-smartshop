(function () {
  const CATALOG_STORAGE_KEY = "smartshop-catalog-data";
  const AUTH_STORAGE_KEY = "smartshop-admin-authenticated";
  const AUTH_PIN_KEY = "smartshop-admin-pin";
  const PRODUCT_CODE_RE = /^\d{5}$/;
  const API_BASE_URL = String(
    window.SMARTSHOP_API_BASE_URL || localStorage.getItem("smartshop-api-base-url") || ""
  ).replace(/\/$/, "");

  const baseData = structuredCloneSafe(window.STORE_DATA || {});
  let data = readLocalCatalog(baseData);
  let apiAvailable = false;

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    bindEvents();
    await loadCatalog();
    ensureProductCodes();
    if (sessionStorage.getItem(AUTH_STORAGE_KEY) === "true") {
      showAdmin();
    } else {
      showLogin();
    }
  }

  function cacheElements() {
    els.loginView = document.querySelector("#loginView");
    els.adminView = document.querySelector("#adminView");
    els.loginForm = document.querySelector("#loginForm");
    els.pinInput = document.querySelector("#pinInput");
    els.loginError = document.querySelector("#loginError");
    els.logoutButton = document.querySelector("#logoutButton");
    els.saveButton = document.querySelector("#saveButton");
    els.resetButton = document.querySelector("#resetButton");
    els.exportExcelButton = document.querySelector("#exportExcelButton");
    els.importExcelInput = document.querySelector("#importExcelInput");
    els.addProductButton = document.querySelector("#addProductButton");
    els.addSellerButton = document.querySelector("#addSellerButton");
    els.adminProducts = document.querySelector("#adminProducts");
    els.adminSellers = document.querySelector("#adminSellers");
    els.adminStatus = document.querySelector("#adminStatus");
    els.adminProductCount = document.querySelector("#adminProductCount");
    els.adminStockTotal = document.querySelector("#adminStockTotal");
    els.adminSellerCount = document.querySelector("#adminSellerCount");
  }

  function bindEvents() {
    els.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const pin = els.pinInput.value;
      if (await validatePin(pin)) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
        sessionStorage.setItem(AUTH_PIN_KEY, pin);
        els.pinInput.value = "";
        showAdmin();
      } else {
        els.loginError.textContent = "PIN incorrecto.";
      }
    });

    els.logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_PIN_KEY);
      showLogin();
    });

    els.saveButton.addEventListener("click", async () => {
      collectFormData();
      ensureProductCodes();
      try {
        await ensureApiAvailable();
        await saveCatalogToApi();
      } catch (error) {
        showStatus(error.message);
      }
      renderAll();
    });

    els.resetButton.addEventListener("click", async () => {
      if (!confirm("Restaurar datos base?")) return;
      data = structuredCloneSafe(baseData);
      try {
        await ensureApiAvailable();
        await saveCatalogToApi();
        localStorage.removeItem(CATALOG_STORAGE_KEY);
        renderAll();
        showStatus("Datos base restaurados en la base de datos.");
      } catch (error) {
        renderAll();
        showStatus(error.message);
      }
    });

    els.exportExcelButton.addEventListener("click", () => {
      if (!apiAvailable) {
        showStatus("La exportacion Excel requiere iniciar el servidor con base de datos.");
        return;
      }
      fetch(apiUrl("/api/products/export-excel"), { headers: authHeaders() })
        .then((response) => {
          if (!response.ok) throw new Error("No se pudo exportar.");
          return response.blob();
        })
        .then((blob) => downloadBlob(blob, "smartshop-productos.xlsx"))
        .catch((error) => showStatus(error.message));
    });

    els.importExcelInput.addEventListener("change", async () => {
      const file = els.importExcelInput.files[0];
      if (!file) return;
      if (!apiAvailable) {
        showStatus("La importacion Excel requiere iniciar el servidor con base de datos.");
        els.importExcelInput.value = "";
        return;
      }
      try {
        const response = await fetch(apiUrl("/api/products/import-excel"), {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/octet-stream" },
          body: file,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "No se pudo importar.");
        await loadCatalog();
        renderAll();
        showStatus(`Excel importado: ${result.imported} altas/actualizaciones, ${result.deleted} eliminados.`);
      } catch (error) {
        showStatus(error.message);
      } finally {
        els.importExcelInput.value = "";
      }
    });

    els.addProductButton.addEventListener("click", () => {
      collectFormData();
      data.products.push(createProduct());
      renderAll();
      showStatus("Producto agregado.");
    });

    els.addSellerButton.addEventListener("click", () => {
      collectFormData();
      data.sellers.push(createSeller());
      renderAll();
      showStatus("Vendedor agregado.");
    });

    els.adminProducts.addEventListener("click", (event) => {
      const button = event.target.closest("[data-product-action]");
      if (!button) return;
      collectFormData();
      const index = Number(button.dataset.index);
      if (button.dataset.productAction === "delete") data.products.splice(index, 1);
      if (button.dataset.productAction === "duplicate") {
        const copy = structuredCloneSafe(data.products[index]);
        copy.id = uniqueId(copy.name || "producto");
        copy.code = "";
        copy.sku = "";
        copy.name = `${copy.name || "Producto"} copia`;
        data.products.splice(index + 1, 0, copy);
      }
      renderAll();
    });

    els.adminSellers.addEventListener("click", (event) => {
      const button = event.target.closest("[data-seller-action]");
      if (!button) return;
      collectFormData();
      const index = Number(button.dataset.index);
      if (button.dataset.sellerAction === "delete") data.sellers.splice(index, 1);
      renderAll();
    });
  }

  async function loadCatalog() {
    try {
      const response = await fetch(apiUrl("/api/catalog"), { cache: "no-store" });
      if (!response.ok) throw new Error("API no disponible");
      data = normalizeCatalog(await response.json());
      apiAvailable = true;
    } catch {
      data = readLocalCatalog(baseData);
      apiAvailable = false;
    }
  }

  async function validatePin(pin) {
    if (apiAvailable) {
      try {
      const response = await fetch(apiUrl("/api/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        return response.ok;
      } catch {
        return false;
      }
    }
    return pin === String(data.store?.adminPin || baseData.store?.adminPin || "");
  }

  async function saveCatalogToApi() {
    const response = await fetch(apiUrl("/api/catalog"), {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "No se pudo guardar en la base de datos.");
    }
    showStatus("Cambios guardados en la base de datos.");
  }

  async function ensureApiAvailable() {
    if (!apiAvailable) {
      try {
        const response = await fetch(apiUrl("/api/health"), { cache: "no-store" });
        apiAvailable = response.ok;
      } catch {
        apiAvailable = false;
      }
    }
    if (!apiAvailable) {
      throw new Error(
        "No hay conexion con la API/base de datos. Abre el panel desde el servidor Node o configura SMARTSHOP_API_BASE_URL."
      );
    }
  }

  function showLogin() {
    els.loginView.hidden = false;
    els.adminView.hidden = true;
    els.loginError.textContent = "";
    els.pinInput.focus();
  }

  function showAdmin() {
    els.loginView.hidden = true;
    els.adminView.hidden = false;
    renderAll();
    if (!apiAvailable) {
      showStatus("Modo sin API: puedes revisar datos, pero para guardar necesitas conectar la base de datos.");
    }
  }

  function renderAll() {
    renderStoreFields();
    renderProducts();
    renderSellers();
    renderSummary();
  }

  function renderStoreFields() {
    document.querySelectorAll("[data-store-field]").forEach((input) => {
      input.value = data.store?.[input.dataset.storeField] || "";
    });
    document.querySelectorAll("[data-social-field]").forEach((input) => {
      input.value = data.store?.social?.[input.dataset.socialField] || "";
    });
  }

  function renderProducts() {
    els.adminProducts.innerHTML = data.products
      .map((product, index) => {
        const details = Array.isArray(product.details) ? product.details.join("\n") : "";
        return `
          <article class="admin-item">
            <div class="admin-item-head">
              <strong>${escapeHtml(product.name || "Producto sin nombre")}</strong>
              <div class="admin-actions">
                <button class="admin-button" type="button" data-product-action="duplicate" data-index="${index}">Duplicar</button>
                <button class="admin-button is-danger" type="button" data-product-action="delete" data-index="${index}">Eliminar</button>
              </div>
            </div>
            <div class="admin-form-grid">
              ${readonlyCode(product, index)}
              ${input("Nombre", "name", product.name, index)}
              ${input("Categoria", "category", product.category, index)}
              ${input("Marca", "brand", product.brand, index)}
              ${input("Variante o capacidad", "variant", product.variant, index)}
              ${input("Precio Gs.", "price", product.price, index, "number")}
              ${input("Stock", "stock", product.stock, index, "number")}
              ${input("Etiqueta", "badge", product.badge, index)}
              ${input("Estado", "condition", product.condition, index)}
              ${input("Garantia", "warranty", product.warranty, index)}
              ${input("Entrega", "delivery", product.delivery, index)}
              <label class="admin-check">
                <input type="checkbox" data-product-index="${index}" data-product-field="featured" ${product.featured ? "checked" : ""}>
                Destacado
              </label>
              ${input("Imagen URL", "image", product.image, index, "url", true)}
              ${textarea("Descripcion", "description", product.description, index)}
              ${textarea("Detalles, uno por linea", "details", details, index)}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSellers() {
    els.adminSellers.innerHTML = data.sellers
      .map((seller, index) => {
        return `
          <article class="admin-item">
            <div class="admin-item-head">
              <strong>${escapeHtml(seller.name || "Vendedor sin nombre")}</strong>
              <button class="admin-button is-danger" type="button" data-seller-action="delete" data-index="${index}">Eliminar</button>
            </div>
            <div class="admin-form-grid">
              ${sellerInput("Nombre", "name", seller.name, index)}
              ${sellerInput("Rol", "role", seller.role, index)}
              ${sellerInput("Telefono WhatsApp", "phone", seller.phone, index)}
              ${sellerInput("Horario", "schedule", seller.schedule, index)}
              ${sellerInput("Foto URL", "image", seller.image, index, true)}
              ${sellerTextarea("Mensaje", "message", seller.message, index)}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderSummary() {
    const stockTotal = data.products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    els.adminProductCount.textContent = data.products.length;
    els.adminStockTotal.textContent = stockTotal;
    els.adminSellerCount.textContent = data.sellers.length;
  }

  function collectFormData() {
    data.store = data.store || {};
    data.store.social = data.store.social || {};

    document.querySelectorAll("[data-store-field]").forEach((input) => {
      data.store[input.dataset.storeField] = input.value.trim();
    });
    document.querySelectorAll("[data-social-field]").forEach((input) => {
      data.store.social[input.dataset.socialField] = input.value.trim();
    });

    document.querySelectorAll("[data-product-index]").forEach((input) => {
      const product = data.products[Number(input.dataset.productIndex)];
      if (!product) return;
      const field = input.dataset.productField;
      if (input.type === "checkbox") {
        product[field] = input.checked;
      } else if (field === "price" || field === "stock") {
        product[field] = Math.max(0, Number(input.value || 0));
      } else if (field === "details") {
        product[field] = input.value.split("\n").map((line) => line.trim()).filter(Boolean);
      } else {
        product[field] = input.value.trim();
      }
      product.id = product.id || uniqueId(product.name || product.sku || "producto");
    });

    ensureProductCodes();

    document.querySelectorAll("[data-seller-index]").forEach((input) => {
      const seller = data.sellers[Number(input.dataset.sellerIndex)];
      if (!seller) return;
      seller[input.dataset.sellerField] = input.value.trim();
      seller.id = seller.id || uniqueId(seller.name || "vendedor");
    });
  }

  function input(label, field, value, index, type = "text", wide = false) {
    return `
      <label class="admin-field${wide ? " is-wide" : ""}">
        <span>${label}</span>
        <input class="admin-input" type="${type}" value="${escapeHtml(value)}" data-product-index="${index}" data-product-field="${field}">
      </label>
    `;
  }

  function readonlyCode(product, index) {
    const code = product.code || "";
    return `
      <label class="admin-field">
        <span>Codigo automatico</span>
        <input class="admin-input" type="text" value="${escapeHtml(code || "Se asigna al guardar")}" data-product-index="${index}" data-product-field="code" readonly>
      </label>
    `;
  }

  function textarea(label, field, value, index) {
    return `
      <label class="admin-field is-wide">
        <span>${label}</span>
        <textarea class="admin-textarea" data-product-index="${index}" data-product-field="${field}">${escapeHtml(value)}</textarea>
      </label>
    `;
  }

  function sellerInput(label, field, value, index, wide = false) {
    return `
      <label class="admin-field${wide ? " is-wide" : ""}">
        <span>${label}</span>
        <input class="admin-input" value="${escapeHtml(value)}" data-seller-index="${index}" data-seller-field="${field}">
      </label>
    `;
  }

  function sellerTextarea(label, field, value, index) {
    return `
      <label class="admin-field is-wide">
        <span>${label}</span>
        <textarea class="admin-textarea" data-seller-index="${index}" data-seller-field="${field}">${escapeHtml(value)}</textarea>
      </label>
    `;
  }

  function createProduct() {
    return {
      id: uniqueId("producto"),
      code: generateProductCode(),
      sku: "",
      name: "",
      category: "General",
      brand: "",
      variant: "",
      price: 0,
      stock: 0,
      featured: false,
      badge: "",
      condition: "Nuevo",
      warranty: "Garantia de tienda",
      delivery: "Retiro en tienda o envio coordinado",
      description: "",
      details: [],
      image: "assets/logo-smartshop.png",
    };
  }

  function createSeller() {
    return {
      id: uniqueId("vendedor"),
      name: "",
      role: "",
      phone: "",
      schedule: "Lunes a Sabado, 07:30 a 15:30",
      message: "Hola, quiero consultar un producto de SmartShop.",
      image: "assets/logo-smartshop.png",
    };
  }

  function ensureProductCodes() {
    const usedCodes = new Set();
    data.products.forEach((product) => {
      const code = String(product.code || "").trim();
      if (PRODUCT_CODE_RE.test(code) && !usedCodes.has(code)) {
        product.code = code;
        usedCodes.add(code);
      } else {
        product.code = generateProductCode(usedCodes);
      }
      if (!product.sku) product.sku = `SKU-${product.code}`;
    });
  }

  function generateProductCode(usedCodes = new Set(data.products.map((product) => String(product.code || "")))) {
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const code = String(Math.floor(10000 + Math.random() * 90000));
      if (!usedCodes.has(code)) {
        usedCodes.add(code);
        return code;
      }
    }
    return String(Date.now()).slice(-5).padStart(5, "1");
  }

  function authHeaders() {
    return { "X-Admin-Pin": getPin() };
  }

  function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
  }

  function getPin() {
    return sessionStorage.getItem(AUTH_PIN_KEY) || "";
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function readLocalCatalog(fallbackData) {
    try {
      const savedData = JSON.parse(localStorage.getItem(CATALOG_STORAGE_KEY) || "null");
      return normalizeCatalog(savedData || fallbackData);
    } catch {
      return normalizeCatalog(fallbackData);
    }
  }

  function normalizeCatalog(catalog) {
    const source = catalog || {};
    return {
      store: source.store || {},
      products: Array.isArray(source.products) ? source.products : [],
      sellers: Array.isArray(source.sellers)
        ? source.sellers.map((seller, index) => ({
            ...seller,
            id: seller.id || `seller-${index + 1}`,
            image: seller.image || "assets/logo-smartshop.png",
          }))
        : [],
    };
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uniqueId(value) {
    const base = String(value || "item")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 36);
    return `${base || "item"}-${Date.now().toString(36)}`;
  }

  function showStatus(message) {
    els.adminStatus.textContent = message;
    window.clearTimeout(showStatus.timeout);
    showStatus.timeout = window.setTimeout(() => {
      els.adminStatus.textContent = "";
    }, 3600);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
