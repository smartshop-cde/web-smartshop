(function () {
  const PLACE_ID_PLACEHOLDER = "TU_PLACE_ID_AQUI";
  const DEFAULT_ADDRESS =
    "Avda. Adrian Jara esquina Avda. Carlos Antonio Lopez, Galeria Jebai 4to piso, Ciudad del Este, Paraguay";
  const API_BASE_URL = String(
    window.SMARTSHOP_API_BASE_URL || localStorage.getItem("smartshop-api-base-url") || ""
  ).replace(/\/$/, "");

  const baseData = window.STORE_DATA || {};
  let data = normalizeCatalog(baseData);
  let store = data.store;
  let products = data.products;
  let sellers = data.sellers;

  const state = {
    category: "Todos",
    onlyAvailable: false,
    brand: "Todas",
    minPrice: "",
    maxPrice: "",
    search: "",
    sort: "featured",
    loading: true,
    error: "",
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    hydrateStaticIcons();
    bindEvents();
    renderAll();
    await loadCatalog();
    renderAll();
  }

  function cacheElements() {
    els.searchInput = document.querySelector("#searchInput");
    els.mobileMenuToggle = document.querySelector("#mobileMenuToggle");
    els.siteNav = document.querySelector("#siteNav");
    els.sortSelect = document.querySelector("#sortSelect");
    els.filterToggle = document.querySelector("#filterToggle");
    els.filterClose = document.querySelector("#filterClose");
    els.catalogFilters = document.querySelector("#catalogFilters");
    els.onlyAvailable = document.querySelector("#onlyAvailable");
    els.minPriceInput = document.querySelector("#minPriceInput");
    els.maxPriceInput = document.querySelector("#maxPriceInput");
    els.categoryFilters = document.querySelector("#categoryFilters");
    els.categoryCards = document.querySelector("#categoryCards");
    els.brandFilters = document.querySelector("#brandFilters");
    els.brandsSection = document.querySelector("#brandsSection");
    els.brandStrip = document.querySelector("#brandStrip");
    els.navCategoryList = document.querySelector("#navCategoryList");
    els.navSellerList = document.querySelector("#navSellerList");
    els.featuredSection = document.querySelector("#featuredSection");
    els.featuredGrid = document.querySelector("#featuredGrid");
    els.heroShowcase = document.querySelector("#heroShowcase");
    els.productGrid = document.querySelector("#productGrid");
    els.resultCount = document.querySelector("#resultCount");
    els.emptyState = document.querySelector("#emptyState");
    els.catalogError = document.querySelector("#catalogError");
    els.retryCatalog = document.querySelector("#retryCatalog");
    els.clearFilters = document.querySelector("#clearFilters");
    els.availableProducts = document.querySelector("#availableProducts");
    els.stockHealth = document.querySelector("#stockHealth");
    els.stockSummary = document.querySelector("#stockSummary");
    els.totalProducts = document.querySelector("#totalProducts");
    els.totalUnits = document.querySelector("#totalUnits");
    els.soldOutProducts = document.querySelector("#soldOutProducts");
    els.sellerGrid = document.querySelector("#sellerGrid");
    els.addressText = document.querySelector("#addressText");
    els.hoursText = document.querySelector("#hoursText");
    els.mapsEmbed = document.querySelector("#mapsEmbed");
    els.directionsLink = document.querySelector("#directionsLink");
    els.instagramLink = document.querySelector("#instagramLink");
    els.tiktokLink = document.querySelector("#tiktokLink");
    els.footerInstagramLink = document.querySelector("#footerInstagramLink");
    els.footerTiktokLink = document.querySelector("#footerTiktokLink");
    els.heroWhatsappLink = document.querySelector("#heroWhatsappLink");
    els.floatingWhatsapp = document.querySelector("#floatingWhatsapp");
    els.productDialog = document.querySelector("#productDialog");
    els.dialogContent = document.querySelector("#dialogContent");
    els.dialogClose = document.querySelector("#dialogClose");
  }

  function bindEvents() {
    els.mobileMenuToggle.addEventListener("click", () => {
      const isOpen = els.siteNav.classList.toggle("is-open");
      els.mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    els.siteNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMobileMenu();
    });

    els.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      renderProducts();
    });

    els.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderProducts();
    });

    els.onlyAvailable.addEventListener("change", (event) => {
      state.onlyAvailable = event.target.checked;
      renderProducts();
    });

    els.minPriceInput.addEventListener("input", (event) => {
      state.minPrice = event.target.value;
      renderProducts();
    });

    els.maxPriceInput.addEventListener("input", (event) => {
      state.maxPrice = event.target.value;
      renderProducts();
    });

    els.categoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (button) setCategory(button.dataset.category);
    });

    els.categoryCards.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (button) setCategory(button.dataset.category, true);
    });

    els.navCategoryList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (button) setCategory(button.dataset.category, true);
    });

    els.brandFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-brand]");
      if (button) setBrand(button.dataset.brand);
    });

    els.brandStrip.addEventListener("click", (event) => {
      const button = event.target.closest("[data-brand]");
      if (button) setBrand(button.dataset.brand, true);
    });

    els.filterToggle.addEventListener("click", () => {
      const isOpen = els.catalogFilters.classList.toggle("is-open");
      els.filterToggle.setAttribute("aria-expanded", String(isOpen));
    });

    els.filterClose.addEventListener("click", () => {
      closeFilters();
    });

    els.retryCatalog.addEventListener("click", () => {
      loadCatalog().then(renderAll);
    });

    els.clearFilters.addEventListener("click", () => {
      clearFilters();
    });

    document.querySelector("#clearFiltersPanel").addEventListener("click", () => {
      clearFilters();
      closeFilters();
    });

    document.querySelectorAll("[data-seller-scroll]").forEach((button) => {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.sellerScroll);
        els.sellerGrid.scrollBy({
          left: direction * Math.max(260, els.sellerGrid.clientWidth * 0.78),
          behavior: "smooth",
        });
      });
    });

    els.productGrid.addEventListener("click", handleProductDetailClick);
    els.featuredGrid.addEventListener("click", handleProductDetailClick);

    els.dialogClose.addEventListener("click", () => closeProductDialog());
    els.productDialog.addEventListener("click", (event) => {
      if (event.target === els.productDialog) closeProductDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.productDialog.open) closeProductDialog();
    });
  }

  async function loadCatalog() {
    state.loading = true;
    state.error = "";
    renderProducts();
    try {
      const [catalogResult, productsResult] = await Promise.allSettled([
        fetch(apiUrl("/api/catalog"), { cache: "no-store" }),
        fetch(apiUrl("/api/products?limit=100"), { cache: "no-store" }),
      ]);
      const catalogResponse = catalogResult.status === "fulfilled" ? catalogResult.value : null;
      if (!catalogResponse?.ok) throw new Error("API no disponible");
      const catalogData = await catalogResponse.json();
      const productsResponse = productsResult.status === "fulfilled" ? productsResult.value : null;
      if (productsResponse?.ok) {
        const productsPayload = await productsResponse.json();
        catalogData.products = productsPayload.success ? productsPayload.data : catalogData.products;
      }
      data = normalizeCatalog(catalogData);
    } catch {
      data = normalizeCatalog(baseData);
      if (!data.products.length) {
        state.error = "No pudimos cargar el catalogo.";
      }
    } finally {
      store = data.store;
      products = data.products;
      sellers = data.sellers;
      state.loading = false;
    }
  }

  function renderAll() {
    renderStoreInfo();
    renderCategories();
    renderBrands();
    renderNavigationMenus();
    renderSellers();
    renderHeroShowcase();
    renderFeaturedProducts();
    renderProducts();
    injectStructuredData();
  }

  function renderStoreInfo() {
    const social = store.social || {};
    const socialUsername = social.username || "@smartshopcde";
    const address = store.address || DEFAULT_ADDRESS;
    const hours = store.hours || "Lunes a Sabado\n07:30 a 15:30";
    const mapsUrl = getMapsUrl(address);
    const directionsUrl = getDirectionsUrl(address);
    const heroSeller = sellers.find((seller) => seller.phone) || sellers[0];

    document.querySelectorAll("[data-store-name]").forEach((node) => {
      node.textContent = store.name || "SmartShop";
    });
    document.querySelectorAll("[data-store-tagline]").forEach((node) => {
      node.textContent = store.tagline || "Catalogo con stock actualizado";
    });
    document.querySelectorAll("[data-footer-store]").forEach((node) => {
      node.textContent = store.name || "SmartShop";
    });
    document.querySelectorAll("[data-social-username]").forEach((node) => {
      node.textContent = socialUsername;
    });

    els.addressText.textContent = compactAddress(address);
    els.hoursText.innerHTML = escapeHtml(hours).replace(/\n/g, "<br>");
    els.mapsEmbed.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    els.directionsLink.href = directionsUrl;
    els.instagramLink.href = social.instagram || "https://www.instagram.com/smartshopcde";
    els.tiktokLink.href = social.tiktok || "https://www.tiktok.com/@smartshopcde";
    els.footerInstagramLink.href = els.instagramLink.href;
    els.footerTiktokLink.href = els.tiktokLink.href;
    els.heroWhatsappLink.href = heroSeller
      ? getWhatsAppUrl(heroSeller.phone, store.whatsappFallbackMessage || "")
      : "#catalogo";
    els.heroWhatsappLink.setAttribute("aria-label", "Hablar por WhatsApp con SmartShop");
    els.floatingWhatsapp.href = els.heroWhatsappLink.href;

    if (!isConfiguredPlaceId(store.googlePlaceId)) {
      els.directionsLink.href = mapsUrl;
    }
  }

  function renderCategories() {
    const categories = getCategories();
    els.categoryFilters.innerHTML = categories
      .map((category) => {
        const selected = category === state.category;
        return `
          <button type="button" class="filter-chip${selected ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${selected}">
            ${escapeHtml(category)}
          </button>
        `;
      })
      .join("");

    els.categoryCards.innerHTML = categories
      .filter((category) => category !== "Todos")
      .map((category) => {
        const count = products.filter((product) => product.category === category).length;
        const selected = category === state.category;
        return `
          <button type="button" class="category-card${selected ? " is-active" : ""}" data-category="${escapeHtml(category)}">
            <span class="category-icon" aria-hidden="true">${iconSvg(getCategoryIcon(category))}</span>
            <strong>${escapeHtml(category)}</strong>
            <small>${count} ${pluralize(count, "producto", "productos")} <span aria-hidden="true">&rarr;</span></small>
          </button>
        `;
      })
      .join("");
  }

  function renderBrands() {
    const brands = getBrands();
    els.brandsSection.hidden = state.loading || Boolean(state.error) || brands.length <= 1;
    els.brandFilters.innerHTML = brands
      .map((brand) => {
        const selected = brand === state.brand;
        return `
          <button type="button" class="filter-chip${selected ? " is-active" : ""}" data-brand="${escapeHtml(brand)}" aria-pressed="${selected}">
            ${escapeHtml(brand)}
          </button>
        `;
      })
      .join("");

    els.brandStrip.innerHTML = brands
      .filter((brand) => brand !== "Todas")
      .map((brand) => {
        const count = products.filter((product) => product.brand === brand).length;
        const selected = brand === state.brand;
        return `
          <button type="button" class="brand-pill${selected ? " is-active" : ""}" data-brand="${escapeHtml(brand)}">
            ${escapeHtml(brand)}
            <span>${count}</span>
          </button>
        `;
      })
      .join("");
  }

  function renderNavigationMenus() {
    els.navCategoryList.innerHTML = getCategories()
      .map(
        (category) => `
          <button type="button" data-category="${escapeHtml(category)}">
            <span>${escapeHtml(category)}</span>
            <small>${category === "Todos" ? products.length : products.filter((product) => product.category === category).length}</small>
          </button>
        `
      )
      .join("");

    els.navSellerList.innerHTML = sellers
      .map(
        (seller) => `
          <a href="${getWhatsAppUrl(seller.phone, seller.message || store.whatsappFallbackMessage || "")}" target="_blank" rel="noopener">
            <img src="${escapeHtml(seller.image)}" alt="" loading="lazy" decoding="async">
            <span>
              <strong>${escapeHtml(seller.name)}</strong>
              ${seller.role ? `<small>${escapeHtml(seller.role)}</small>` : ""}
            </span>
          </a>
        `
      )
      .join("");
  }

  function renderFeaturedProducts() {
    const featured = products.filter((product) => product.featured).slice(0, 4);
    els.featuredSection.hidden = state.loading || Boolean(state.error) || featured.length === 0;
    els.featuredGrid.innerHTML = els.featuredSection.hidden
      ? ""
      : featured.map((product) => renderProductCard(product, { compact: true })).join("");
  }

  function renderHeroShowcase() {
    const heroProducts = products.filter((product) => product.image).slice(0, 4);
    els.heroShowcase.innerHTML = heroProducts.length
      ? heroProducts
          .map(
            (product, index) => `
              <figure class="hero-product hero-product-${index + 1}">
                <img src="${escapeHtml(product.image)}" alt="" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
              </figure>
            `
          )
          .join("")
      : `<img class="hero-logo-fallback" src="assets/logo-smartshop.webp" width="160" height="160" alt="">`;
  }

  function renderProducts() {
    if (!els.productGrid) return;

    if (state.loading) {
      els.productGrid.setAttribute("aria-busy", "true");
      els.productGrid.innerHTML = renderSkeletonCards(6);
      els.catalogError.hidden = true;
      els.emptyState.hidden = true;
      els.stockSummary.hidden = true;
      els.resultCount.textContent = "Cargando catalogo";
      els.availableProducts.textContent = "Cargando catalogo";
      els.stockHealth.textContent = "Preparando stock y precios";
      return;
    }

    if (state.error) {
      els.productGrid.setAttribute("aria-busy", "false");
      els.productGrid.innerHTML = "";
      els.catalogError.hidden = false;
      els.emptyState.hidden = true;
      els.stockSummary.hidden = true;
      els.resultCount.textContent = "No disponible";
      els.availableProducts.textContent = "Catalogo no disponible";
      els.stockHealth.textContent = "Intenta cargar nuevamente";
      return;
    }

    const filteredProducts = getVisibleProducts();
    const totalUnits = products.reduce((sum, product) => sum + getStock(product), 0);
    const availableCount = products.filter((product) => getStock(product) > 0).length;
    const soldOutCount = products.length - availableCount;

    els.productGrid.setAttribute("aria-busy", "false");
    els.productGrid.innerHTML = filteredProducts.map((product) => renderProductCard(product)).join("");
    els.catalogError.hidden = true;
    els.emptyState.hidden = filteredProducts.length > 0;
    els.stockSummary.hidden = false;
    els.resultCount.textContent =
      filteredProducts.length === products.length
        ? `${products.length} ${pluralize(products.length, "producto", "productos")}`
        : `Mostrando ${filteredProducts.length} de ${products.length}`;
    els.availableProducts.textContent = `${availableCount} ${pluralize(availableCount, "disponible", "disponibles")}`;
    els.stockHealth.textContent = soldOutCount > 0 ? `${soldOutCount} sin stock` : "Stock listo para consultar";
    els.totalProducts.textContent = products.length;
    els.totalUnits.textContent = totalUnits;
    els.soldOutProducts.textContent = soldOutCount;
  }

  function renderProductCard(product, options = {}) {
    const stock = getStock(product);
    const stockStatus = getStockStatus(stock);
    const seller = sellers[0];
    const whatsappUrl = seller ? getWhatsAppUrl(seller.phone, buildProductMessage(product, stock)) : "#";
    const actionText = stock > 0 ? "Consultar por WhatsApp" : "Consultar reposicion";
    const code = getProductCode(product);
    const brand = product.brand || "";
    const variant = product.variant || "";

    return `
      <article class="product-card ${stockStatus.className}${options.compact ? " is-compact" : ""}">
        <div class="product-image">
          ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}
          <button class="wishlist-button" type="button" aria-label="Agregar ${escapeHtml(product.name)} a favoritos">${iconSvg("heart")}</button>
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" width="760" height="760" onerror="this.parentElement.classList.add('image-fallback'); this.remove();">
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${escapeHtml(brand || product.category)}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          ${variant ? `<p class="product-variant">${escapeHtml(variant)}</p>` : ""}
          ${product.description ? `<p>${escapeHtml(product.description)}</p>` : ""}
          <ul class="product-specs">
            ${getProductDetails(product)
              .slice(0, 3)
              .map((detail) => `<li>${escapeHtml(detail)}</li>`)
              .join("")}
          </ul>
          <div class="price-row">
            <strong>${formatPrice(product.price)}</strong>
          </div>
          <div class="product-foot">
            <span class="product-code">Codigo: ${escapeHtml(code)}</span>
            <span class="stock-pill ${stockStatus.className}"><span aria-hidden="true"></span>${stockStatus.label}: ${stock}</span>
          </div>
          <div class="product-actions">
            <button class="ghost-button" type="button" data-product-detail data-id="${escapeHtml(product.id)}">Ver producto</button>
            <a class="product-action" href="${whatsappUrl}" target="_blank" rel="noopener">${actionText}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderSkeletonCards(count) {
    return Array.from({ length: count }, () => `
      <article class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-image"></div>
        <div class="product-body">
          <span class="skeleton skeleton-line is-short"></span>
          <span class="skeleton skeleton-line is-title"></span>
          <span class="skeleton skeleton-line"></span>
          <span class="skeleton skeleton-line is-price"></span>
        </div>
      </article>
    `).join("");
  }

  function renderSellers() {
    els.sellerGrid.innerHTML = sellers
      .map((seller) => {
        const message = seller.message || store.whatsappFallbackMessage || "";
        return `
          <article class="seller-card">
            <img class="seller-photo" src="${escapeHtml(seller.image)}" alt="Foto de ${escapeHtml(seller.name)}" loading="lazy" decoding="async" onerror="this.src='assets/logo-smartshop.png';">
            <div>
              ${seller.role ? `<span class="seller-role">${escapeHtml(seller.role)}</span>` : ""}
              <h3>${escapeHtml(seller.name)}</h3>
              ${seller.schedule ? `<p>${escapeHtml(seller.schedule)}</p>` : ""}
            </div>
            <a class="seller-link" href="${getWhatsAppUrl(seller.phone, message)}" target="_blank" rel="noopener">
              ${iconSvg("message-circle")}
              Hablar por WhatsApp
            </a>
          </article>
        `;
      })
      .join("");
  }

  function handleProductDetailClick(event) {
    const button = event.target.closest("[data-product-detail]");
    if (!button) return;
    const product = products.find((item) => item.id === button.dataset.id);
    if (product) openProductDialog(product);
  }

  function openProductDialog(product) {
    const stock = getStock(product);
    const stockStatus = getStockStatus(stock);
    const details = getProductDetails(product);
    const sellerButtons = sellers
      .map(
        (seller) => `
          <a class="seller-link" href="${getWhatsAppUrl(seller.phone, buildProductMessage(product, stock))}" target="_blank" rel="noopener">
            ${escapeHtml(seller.name)}
          </a>
        `
      )
      .join("");

    els.dialogContent.innerHTML = `
      <div class="dialog-product">
        <div class="dialog-image">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="760" height="570" loading="lazy" decoding="async">
        </div>
        <div class="dialog-info">
          ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}
          <h2 id="dialogTitle">${escapeHtml(product.name)}</h2>
          ${product.description ? `<p>${escapeHtml(product.description)}</p>` : ""}
          <div class="price-row">
            <strong>${formatPrice(product.price)}</strong>
            <span class="stock-pill ${stockStatus.className}">${stockStatus.label}: ${stock}</span>
          </div>
          <dl class="detail-list">
            <div><dt>Codigo</dt><dd>${escapeHtml(getProductCode(product))}</dd></div>
            ${product.brand ? `<div><dt>Marca</dt><dd>${escapeHtml(product.brand)}</dd></div>` : ""}
            ${product.variant ? `<div><dt>Variante</dt><dd>${escapeHtml(product.variant)}</dd></div>` : ""}
            <div><dt>Estado</dt><dd>${escapeHtml(product.condition || "Nuevo")}</dd></div>
            <div><dt>Garantia</dt><dd>${escapeHtml(product.warranty || "Consultar con tienda")}</dd></div>
            <div><dt>Entrega</dt><dd>${escapeHtml(product.delivery || "Retiro en tienda o envio coordinado")}</dd></div>
          </dl>
          <ul class="product-specs is-large">${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
          <div class="dialog-actions">${sellerButtons}</div>
        </div>
      </div>
    `;

    if (typeof els.productDialog.showModal === "function") {
      els.productDialog.showModal();
    } else {
      els.productDialog.setAttribute("open", "");
    }
  }

  function closeProductDialog() {
    if (typeof els.productDialog.close === "function") {
      els.productDialog.close();
    } else {
      els.productDialog.removeAttribute("open");
    }
  }

  function setCategory(category, shouldScroll = false) {
    state.category = category;
    renderCategories();
    renderProducts();
    if (shouldScroll) {
      document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setBrand(brand, shouldScroll = false) {
    state.brand = brand;
    renderBrands();
    renderProducts();
    if (shouldScroll) {
      document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clearFilters() {
    state.category = "Todos";
    state.brand = "Todas";
    state.onlyAvailable = false;
    state.minPrice = "";
    state.maxPrice = "";
    state.search = "";
    els.searchInput.value = "";
    els.onlyAvailable.checked = false;
    els.minPriceInput.value = "";
    els.maxPriceInput.value = "";
    renderCategories();
    renderBrands();
    renderProducts();
  }

  function getCategories() {
    return ["Todos", ...new Set(products.map((product) => product.category).filter(Boolean))];
  }

  function getBrands() {
    return ["Todas", ...new Set(products.map((product) => product.brand).filter(Boolean))];
  }

  function getVisibleProducts() {
    const search = normalizeText(state.search);
    const minPrice = Number(state.minPrice) || 0;
    const maxPrice = Number(state.maxPrice) || Infinity;
    return products
      .filter((product) => {
        const matchesCategory = state.category === "Todos" || product.category === state.category;
        const matchesBrand = state.brand === "Todas" || product.brand === state.brand;
        const stock = getStock(product);
        const matchesAvailability = !state.onlyAvailable || stock > 0;
        const matchesPrice = Number(product.price || 0) >= minPrice && Number(product.price || 0) <= maxPrice;
        const haystack = normalizeText(
          `${product.name} ${product.category} ${product.code} ${product.sku} ${product.brand} ${product.variant} ${product.description}`
        );
        return matchesCategory && matchesBrand && matchesAvailability && matchesPrice && haystack.includes(search);
      })
      .sort(sortProducts);
  }

  function sortProducts(a, b) {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "stock-desc") return getStock(b) - getStock(a);
    if (state.sort === "name-asc") return a.name.localeCompare(b.name, "es");
    return Number(b.featured) - Number(a.featured) || getStock(b) - getStock(a);
  }

  function getStock(product) {
    return Number(product.stock) || 0;
  }

  function getStockStatus(stock) {
    if (stock <= 0) return { label: "Agotado", className: "is-sold-out" };
    if (stock <= 3) return { label: "Pocas unidades", className: "is-low-stock" };
    return { label: "En stock", className: "is-available" };
  }

  function getProductCode(product) {
    return product.code || product.sku || "";
  }

  function getProductDetails(product) {
    return Array.isArray(product.details) && product.details.length
      ? product.details
      : [product.variant, product.condition, product.warranty, product.delivery].filter(Boolean);
  }

  function buildProductMessage(product, stock) {
    const pieces = [
      store.whatsappFallbackMessage || "Hola, quiero consultar un producto.",
      `Producto: ${product.name}`,
      `Codigo: ${getProductCode(product)}`,
      `Precio: ${formatPrice(product.price)}`,
      `Stock web: ${stock}`,
    ];
    if (store.domain) pieces.push(`Web: https://${store.domain}`);
    return pieces.join(" | ");
  }

  function normalizeCatalog(catalog) {
    const normalized = catalog || {};
    const normalizedSellers = Array.isArray(normalized.sellers) ? normalized.sellers : [];
    return {
      store: normalized.store || {},
      products: Array.isArray(normalized.products)
        ? normalized.products.map((product) => ({
            ...product,
            code: product.code || "",
            brand: product.brand || "",
            variant: product.variant || "",
            image: product.image || "assets/logo-smartshop.png",
          }))
        : [],
      sellers: normalizedSellers.map((seller, index) => ({
        ...seller,
        id: seller.id || `seller-${index + 1}`,
        image: seller.image || "assets/logo-smartshop.png",
      })),
    };
  }

  function formatPrice(value) {
    const amount = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(Number(value) || 0);
    return `Gs. ${amount}`;
  }

  function getWhatsAppUrl(phone, message) {
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (!cleanPhone) return "#";
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
  }

  function getMapsUrl(address = store.address || DEFAULT_ADDRESS) {
    const query = encodeURIComponent(`${store.name || "SmartShop"} ${address}`);
    if (isConfiguredPlaceId(store.googlePlaceId)) {
      return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(store.googlePlaceId)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  function getDirectionsUrl(address = store.address || DEFAULT_ADDRESS) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }

  function compactAddress(address) {
    return String(address || DEFAULT_ADDRESS).replace(", Ciudad del Este, Paraguay", "");
  }

  function getCategoryIcon(category) {
    const normalized = normalizeText(category);
    if (normalized.includes("cel")) return "smartphone";
    if (normalized.includes("audio")) return "headphones";
    if (normalized.includes("gaming")) return "gamepad-2";
    if (normalized.includes("informatica") || normalized.includes("notebook")) return "laptop";
    if (normalized.includes("watch") || normalized.includes("reloj")) return "watch";
    return "package";
  }

  function closeMobileMenu() {
    els.siteNav.classList.remove("is-open");
    els.mobileMenuToggle.setAttribute("aria-expanded", "false");
  }

  function closeFilters() {
    els.catalogFilters.classList.remove("is-open");
    els.filterToggle.setAttribute("aria-expanded", "false");
  }

  function hydrateStaticIcons() {
    document.querySelectorAll("[data-icon]").forEach((node) => {
      node.innerHTML = iconSvg(node.dataset.icon);
    });
  }

  function iconSvg(name) {
    const icons = {
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
      menu: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>',
      x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
      heart: '<path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1Z"></path>',
      user: '<path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4"></circle>',
      "shopping-cart": '<circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.1 2.1h2l2.7 12.7a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6l1.2-6.7H5.4"></path>',
      "chevron-right": '<path d="m9 18 6-6-6-6"></path>',
      "message-circle": '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-.9L3 20l1.1-4.8a8.3 8.3 0 0 1-.9-3.8 8.4 8.4 0 0 1 17.8.1Z"></path>',
      "package-check": '<path d="m16 16 2 2 4-4"></path><path d="M21 10V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 1 .3"></path><path d="M3.3 7 12 12l8.7-5"></path><path d="M12 22V12"></path>',
      "map-pin": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
      phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1A19.2 19.2 0 0 1 5.2 12 19.7 19.7 0 0 1 2.1 3.4 2 2 0 0 1 4.1 1h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9a16 16 0 0 0 6.9 6.9l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"></path>',
      "badge-dollar-sign": '<path d="M3.9 10.2a2 2 0 0 0 0 3.6l1.8 1a2 2 0 0 1 .8.8l1 1.8a2 2 0 0 0 3.6 0l1-1.8a2 2 0 0 1 .8-.8l1.8-1a2 2 0 0 0 0-3.6l-1.8-1a2 2 0 0 1-.8-.8l-1-1.8a2 2 0 0 0-3.6 0l-1 1.8a2 2 0 0 1-.8.8Z"></path><path d="M9 8v8"></path><path d="M11.5 10a2 2 0 0 0-2.5 0 1.4 1.4 0 0 0 0 2.1c.5.4 1.6.5 2.1.9a1.4 1.4 0 0 1 0 2.1 2 2 0 0 1-2.6 0"></path>',
      smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"></rect><path d="M12 18h.01"></path>',
      headphones: '<path d="M3 14v-3a9 9 0 0 1 18 0v3"></path><path d="M21 17a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3h5v3Z"></path><path d="M8 17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3h5v3Z"></path>',
      "gamepad-2": '<line x1="6" x2="10" y1="11" y2="11"></line><line x1="8" x2="8" y1="9" y2="13"></line><line x1="15" x2="15.01" y1="12" y2="12"></line><line x1="18" x2="18.01" y1="10" y2="10"></line><path d="M17.3 5H6.7A4.7 4.7 0 0 0 2 9.7v4.6A4.7 4.7 0 0 0 6.7 19c1.1 0 2.1-.4 2.9-1.1l.9-.9h3l.9.9A4.7 4.7 0 0 0 22 14.3V9.7A4.7 4.7 0 0 0 17.3 5Z"></path>',
      laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9"></path><path d="M2 20h20"></path>',
      watch: '<circle cx="12" cy="12" r="6"></circle><path d="M12 9v3l2 1"></path><path d="m9 2 1 4"></path><path d="m15 2-1 4"></path><path d="m9 22 1-4"></path><path d="m15 22-1-4"></path>',
      package: '<path d="m7.5 4.3 9 5.2"></path><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"></path><path d="M3.3 7 12 12l8.7-5"></path><path d="M12 22V12"></path>',
      "sliders-horizontal": '<line x1="21" x2="14" y1="4" y2="4"></line><line x1="10" x2="3" y1="4" y2="4"></line><line x1="21" x2="12" y1="12" y2="12"></line><line x1="8" x2="3" y1="12" y2="12"></line><line x1="21" x2="16" y1="20" y2="20"></line><line x1="12" x2="3" y1="20" y2="20"></line><line x1="14" x2="14" y1="2" y2="6"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="16" x2="16" y1="18" y2="22"></line>',
      navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>',
      instagram: '<rect width="20" height="20" x="2" y="2" rx="5"></rect><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4Z"></path><path d="M17.5 6.5h.01"></path>',
      "music-2": '<circle cx="8" cy="18" r="4"></circle><path d="M12 18V2l7 4"></path>',
    };

    return `<svg class="lucide-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || icons.package}</svg>`;
  }

  function injectStructuredData() {
    if (state.loading || state.error) return;
    document.querySelectorAll('script[data-smartshop-jsonld="true"]').forEach((script) => script.remove());
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.smartshopJsonld = "true";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Store",
      name: store.name || "SmartShop",
      url: store.domain ? `https://${store.domain}` : undefined,
      image: store.domain ? `https://${store.domain}/assets/logo-smartshop.png` : undefined,
      address: store.address || DEFAULT_ADDRESS,
      openingHours: store.hours,
      identifier: isConfiguredPlaceId(store.googlePlaceId)
        ? { "@type": "PropertyValue", propertyID: "Google Place ID", value: store.googlePlaceId }
        : undefined,
      sameAs: [
        getMapsUrl(),
        store.social?.instagram || "https://www.instagram.com/smartshopcde",
        store.social?.tiktok || "https://www.tiktok.com/@smartshopcde",
      ],
      makesOffer: products.map((product) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: product.name,
          sku: getProductCode(product),
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          image: product.image,
          description: product.description,
        },
        priceCurrency: "PYG",
        price: Number(product.price) || 0,
        availability: getStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      })),
    });
    document.head.appendChild(script);
  }

  function isConfiguredPlaceId(placeId) {
    return Boolean(placeId && placeId !== PLACE_ID_PLACEHOLDER);
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
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
