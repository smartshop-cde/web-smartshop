(function () {
  const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
  const IMPORT_COLUMNS = [
    ["nombre", "Nombre del producto"],
    ["marca", "Marca"],
    ["categoria", "Categoria"],
    ["variante", "Variante o capacidad"],
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
      variante: "128 GB",
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
      if (session?.user) {
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
    els.adminView = document.querySelector("#adminView");
    els.loginForm = document.querySelector("#loginForm");
    els.emailInput = document.querySelector("#emailInput");
    els.passwordInput = document.querySelector("#passwordInput");
    els.passwordToggle = document.querySelector("#passwordToggle");
    els.loginButton = document.querySelector("#loginButton");
    els.loginError = document.querySelector("#loginError");
    els.logoutButton = document.querySelector("#logoutButton");
    els.reloadButton = document.querySelector("#reloadButton");
    els.adminSyncStatus = document.querySelector("#adminSyncStatus");
    els.dashboardCards = document.querySelector("#dashboardCards");
    els.activeProductsCount = document.querySelector("#activeProductsCount");
    els.soldOutProductsCount = document.querySelector("#soldOutProductsCount");
    els.categoryCount = document.querySelector("#categoryCount");
    els.sellerCount = document.querySelector("#sellerCount");
    els.productsTable = document.querySelector("#productsTable");
    els.categoriesTable = document.querySelector("#categoriesTable");
    els.sellersTable = document.querySelector("#sellersTable");
    els.productEditor = document.querySelector("#productEditor");
    els.categoryEditor = document.querySelector("#categoryEditor");
    els.sellerEditor = document.querySelector("#sellerEditor");
    els.exchangeRatesForm = document.querySelector("#exchangeRatesForm");
    els.usdToBrlInput = document.querySelector("#usdToBrlInput");
    els.usdToPygInput = document.querySelector("#usdToPygInput");
    els.exchangePreview = document.querySelector("#exchangePreview");
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
    els.passwordToggle.addEventListener("click", togglePasswordVisibility);
    els.logoutButton.addEventListener("click", handleLogout);
    els.reloadButton.addEventListener("click", () => loadAndRenderCatalog(true));
    els.downloadTemplateButton.addEventListener("click", downloadImportTemplate);
    els.importProductsInput.addEventListener("change", handleImportFile);
    els.newProductButton.addEventListener("click", () => openProductEditor());
    els.newCategoryButton.addEventListener("click", () => openCategoryEditor());
    els.newSellerButton.addEventListener("click", () => openSellerEditor());

    els.tabs.forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.adminTab));
    });

    els.productsTable.addEventListener("click", handleProductTableAction);
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
    showLogin();
    toast("Sesion cerrada.");
  }

  function togglePasswordVisibility() {
    const shouldShow = els.passwordInput.type === "password";
    els.passwordInput.type = shouldShow ? "text" : "password";
    els.passwordToggle.textContent = shouldShow ? "Ocultar" : "Mostrar";
    els.passwordToggle.setAttribute("aria-label", shouldShow ? "Ocultar contrasena" : "Mostrar contrasena");
    els.passwordToggle.setAttribute("aria-pressed", String(shouldShow));
    els.passwordInput.focus();
  }

  async function showAdmin() {
    els.loginView.hidden = true;
    els.adminView.hidden = false;
    await loadAndRenderCatalog();
  }

  function showLogin() {
    els.loginView.hidden = false;
    els.adminView.hidden = true;
    els.emailInput.focus();
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
    renderProductsTable();
    renderCategoriesTable();
    renderSellersTable();
    renderSettings();
  }

  function renderDashboard() {
    const activeProducts = state.catalog.products.filter((product) => product.active);
    const soldOut = activeProducts.filter((product) => getProductStock(product) <= 0);
    const activeCategories = state.catalog.categories.filter((category) => category.active);
    const activeSellers = state.catalog.sellers.filter((seller) => seller.active);
    const totalStock = activeProducts.reduce((sum, product) => sum + getProductStock(product), 0);

    els.activeProductsCount.textContent = activeProducts.length;
    els.soldOutProductsCount.textContent = soldOut.length;
    els.categoryCount.textContent = activeCategories.length;
    els.sellerCount.textContent = activeSellers.length;

    els.dashboardCards.innerHTML = [
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
        return `
          <tr class="${product.active ? "" : "is-muted"}">
            <td><strong>${escapeHtml(product.public_code || "Auto")}</strong></td>
            <td><img class="admin-thumb" src="${escapeHtml(primaryImage)}" alt="" loading="lazy"></td>
            <td>
              <strong>${escapeHtml(product.name)}</strong>
              <small>${escapeHtml([product.brand, getVariantLabel(product)].filter(Boolean).join(" | "))}</small>
            </td>
            <td>${escapeHtml(product.category?.name || "Sin categoria")}</td>
            <td>${formatPrice(price)}</td>
            <td>${stock}</td>
            <td><span class="status-pill ${product.active ? "is-active" : "is-inactive"}">${product.active ? "Activo" : "Oculto"}</span></td>
            <td>
              <div class="table-actions">
                <button class="admin-button" type="button" data-product-action="edit" data-id="${product.id}">Editar</button>
                <button class="admin-button" type="button" data-product-action="${product.active ? "hide" : "show"}" data-id="${product.id}">${product.active ? "Ocultar" : "Activar"}</button>
                <button class="admin-button is-danger" type="button" data-product-action="delete" data-id="${product.id}">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    els.productsTable.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Categoria</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="8">No hay productos cargados.</td></tr>`}</tbody>
      </table>
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
    const variant = product?.variants?.[0] || {};
    const image = getProductImage(product);
    els.productEditor.hidden = false;
    els.productEditor.innerHTML = `
      <form class="admin-form-grid" data-editor-form="product" data-id="${product?.id || ""}" data-variant-id="${variant.id || ""}">
        <label class="admin-field">
          <span>Codigo automatico</span>
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
        <label class="admin-field">
          <span>Variante</span>
          <input name="variant_name" class="admin-input" value="${escapeHtml(variant.name || "Default")}" required>
        </label>
        <label class="admin-field">
          <span>Precio USD</span>
          <input name="price" class="admin-input" type="number" min="0" step="0.01" value="${Number(variant.price || 0)}" required>
        </label>
        <label class="admin-field">
          <span>Stock</span>
          <input name="stock" class="admin-input" type="number" min="0" step="1" value="${Number(variant.stock || 0)}" required>
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
      const variantId = form.dataset.variantId;
      const name = String(formData.get("name") || "").trim();
      const categoryId = String(formData.get("category_id") || "").trim();
      const price = Math.max(0, Number(formData.get("price") || 0));
      const stock = Math.max(0, Number(formData.get("stock") || 0));
      if (!name || !categoryId) throw new Error("Nombre y categoria son obligatorios.");

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

      const variantPayload = {
        product_id: savedProduct.id,
        name: String(formData.get("variant_name") || "Default").trim() || "Default",
        sku: savedProduct.public_code,
        price,
        stock,
        active: true,
      };

      if (variantId) {
        await updateRow("product_variants", variantId, variantPayload);
      } else {
        await insertRow("product_variants", variantPayload);
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
      const lookupKey = makeProductLookupKey(row.name, row.category, variantName);
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

      const lookupKey = makeProductLookupKey(entry.name, entry.category, entry.variant);
      let product = productMap.get(lookupKey);
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
        await upsertImportedVariant(product, entry, productMap.get(lookupKey)?.variants?.[0]);
        result.updated += 1;
      } else {
        product = await insertRow("products", productPayload);
        await upsertImportedVariant(product, entry);
        productMap.set(lookupKey, {
          ...product,
          category,
          variants: [{ name: entry.variant }],
        });
        result.created += 1;
      }
    }

    return result;
  }

  async function upsertImportedVariant(product, entry, variant = null) {
    const payload = {
      product_id: product.id,
      name: entry.variant || "Default",
      sku: product.public_code,
      price: entry.price,
      stock: entry.stock,
      active: entry.active,
    };
    if (variant?.id) {
      await updateRow("product_variants", variant.id, payload);
    } else {
      await insertRow("product_variants", payload);
    }
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
    if (!input?.files?.[0]) return;
    const preview = document.querySelector(`#${input.dataset.previewTarget}`);
    if (preview) {
      preview.src = URL.createObjectURL(input.files[0]);
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

  function getVariantLabel(product) {
    const variant = product.variants?.find((item) => item.active !== false) || product.variants?.[0];
    return variant?.name === "Default" ? "" : variant?.name || "";
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
      variant: normalized.variant || "Default",
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
        makeProductLookupKey(product.name, product.category?.name || "", getVariantLabel(product) || "Default"),
        product,
      ])
    );
  }

  function buildCategoryIndex() {
    return new Map(state.catalog.categories.map((category) => [normalizeKey(category.name), category]));
  }

  function makeProductLookupKey(name, category, variant) {
    return [name, category, variant || "Default"].map(normalizeKey).join("|");
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
    els.passwordToggle.disabled = disabled;
    els.loginButton.disabled = disabled;
  }

  function setLoginError(message) {
    els.loginError.textContent = message;
  }

  function nullableString(value) {
    const text = String(value || "").trim();
    return text || null;
  }

  function formatPrice(value) {
    return formatUsdPrice(value);
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
})();
