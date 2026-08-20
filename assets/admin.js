(function () {
  const CATALOG_STORAGE_KEY = "smartshop-catalog-data";
  const STOCK_STORAGE_KEY = "smartshop-stock-overrides";
  const AUTH_STORAGE_KEY = "smartshop-admin-authenticated";

  const baseData = structuredCloneSafe(window.STORE_DATA || {});
  let data = readCatalogData(baseData);

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
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
    els.exportButton = document.querySelector("#exportButton");
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
    els.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (els.pinInput.value === String(data.store?.adminPin || baseData.store?.adminPin || "")) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
        els.pinInput.value = "";
        showAdmin();
      } else {
        els.loginError.textContent = "PIN incorrecto.";
      }
    });

    els.logoutButton.addEventListener("click", () => {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      showLogin();
    });

    els.saveButton.addEventListener("click", () => {
      collectFormData();
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(data));
      localStorage.removeItem(STOCK_STORAGE_KEY);
      renderAll();
      showStatus("Cambios guardados en este navegador.");
    });

    els.resetButton.addEventListener("click", () => {
      if (!confirm("Restaurar datos base del archivo store-data.js?")) return;
      data = structuredCloneSafe(baseData);
      localStorage.removeItem(CATALOG_STORAGE_KEY);
      localStorage.removeItem(STOCK_STORAGE_KEY);
      renderAll();
      showStatus("Datos base restaurados.");
    });

    els.exportButton.addEventListener("click", () => {
      collectFormData();
      exportStoreData();
      showStatus("Archivo store-data.js generado.");
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
      if (button.dataset.productAction === "delete") {
        data.products.splice(index, 1);
      }
      if (button.dataset.productAction === "duplicate") {
        const copy = structuredCloneSafe(data.products[index]);
        copy.id = uniqueId(copy.name || "producto");
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
      if (button.dataset.sellerAction === "delete") {
        data.sellers.splice(index, 1);
      }
      renderAll();
    });
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
                <button class="admin-button" type="button" data-product-action="duplicate" data-index="${index}">
                  Duplicar
                </button>
                <button class="admin-button is-danger" type="button" data-product-action="delete" data-index="${index}">
                  Eliminar
                </button>
              </div>
            </div>
            <div class="admin-form-grid">
              ${input("Nombre", "name", product.name, index)}
              ${input("Categoria", "category", product.category, index)}
              ${input("SKU", "sku", product.sku, index)}
              ${input("Precio Gs.", "price", product.price, index, "number")}
              ${input("Stock", "stock", product.stock, index, "number")}
              ${input("Etiqueta", "badge", product.badge, index)}
              ${input("Estado", "condition", product.condition, index)}
              ${input("Garantia", "warranty", product.warranty, index)}
              ${input("Entrega", "delivery", product.delivery, index)}
              <label class="admin-check">
                <input type="checkbox" data-product-index="${index}" data-product-field="featured" ${
                  product.featured ? "checked" : ""
                }>
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
              <button class="admin-button is-danger" type="button" data-seller-action="delete" data-index="${index}">
                Eliminar
              </button>
            </div>
            <div class="admin-form-grid">
              ${sellerInput("Nombre", "name", seller.name, index)}
              ${sellerInput("Rol", "role", seller.role, index)}
              ${sellerInput("Telefono WhatsApp", "phone", seller.phone, index)}
              ${sellerInput("Horario", "schedule", seller.schedule, index)}
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
        product[field] = input.value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      } else {
        product[field] = input.value.trim();
      }
      product.id = product.id || uniqueId(product.name || product.sku || "producto");
    });

    document.querySelectorAll("[data-seller-index]").forEach((input) => {
      const seller = data.sellers[Number(input.dataset.sellerIndex)];
      if (!seller) return;
      seller[input.dataset.sellerField] = input.value.trim();
    });
  }

  function exportStoreData() {
    const js = `window.STORE_DATA = ${JSON.stringify(data, null, 2)};\n`;
    const blob = new Blob([js], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "store-data.js";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function input(label, field, value, index, type = "text", wide = false) {
    return `
      <label class="admin-field${wide ? " is-wide" : ""}">
        <span>${label}</span>
        <input class="admin-input" type="${type}" value="${escapeHtml(
          value
        )}" data-product-index="${index}" data-product-field="${field}">
      </label>
    `;
  }

  function textarea(label, field, value, index) {
    return `
      <label class="admin-field is-wide">
        <span>${label}</span>
        <textarea class="admin-textarea" data-product-index="${index}" data-product-field="${field}">${escapeHtml(
      value
    )}</textarea>
      </label>
    `;
  }

  function sellerInput(label, field, value, index) {
    return `
      <label class="admin-field">
        <span>${label}</span>
        <input class="admin-input" value="${escapeHtml(
          value
        )}" data-seller-index="${index}" data-seller-field="${field}">
      </label>
    `;
  }

  function sellerTextarea(label, field, value, index) {
    return `
      <label class="admin-field is-wide">
        <span>${label}</span>
        <textarea class="admin-textarea" data-seller-index="${index}" data-seller-field="${field}">${escapeHtml(
      value
    )}</textarea>
      </label>
    `;
  }

  function createProduct() {
    return {
      id: uniqueId("producto"),
      name: "Nuevo producto",
      category: "General",
      sku: "SKU-NUEVO",
      price: 0,
      stock: 0,
      featured: false,
      badge: "Nuevo",
      condition: "Nuevo",
      warranty: "Garantia de tienda",
      delivery: "Retiro en tienda o envio coordinado",
      description: "Descripcion del producto.",
      details: ["Detalle principal"],
      image: "assets/logo-smartshop.png",
    };
  }

  function createSeller() {
    return {
      name: "Nuevo vendedor",
      role: "Atencion comercial",
      phone: "595981000000",
      schedule: "Lunes a sabado, 08:00 a 18:00",
      message: "Hola, quiero consultar un producto de SmartShop.",
    };
  }

  function readCatalogData(fallbackData) {
    try {
      const savedData = JSON.parse(localStorage.getItem(CATALOG_STORAGE_KEY) || "null");
      if (savedData && Array.isArray(savedData.products) && Array.isArray(savedData.sellers)) {
        return savedData;
      }
      return structuredCloneSafe(fallbackData);
    } catch (error) {
      return structuredCloneSafe(fallbackData);
    }
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
    }, 2600);
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
