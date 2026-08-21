(function () {
  const PLACE_ID_PLACEHOLDER = "TU_PLACE_ID_AQUI";
  const DEFAULT_ADDRESS =
    "Avda. Adrian Jara esquina Avda. Carlos Antonio Lopez, Galeria Jebai 4to piso, Ciudad del Este, Paraguay";

  const baseData = window.STORE_DATA || {};
  let data = normalizeCatalog(baseData);
  let store = data.store;
  let products = data.products;
  let sellers = data.sellers;

  const state = {
    category: "Todos",
    onlyAvailable: false,
    search: "",
    sort: "featured",
    loading: true,
    error: "",
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    bindEvents();
    renderAll();
    await loadCatalog();
    renderAll();
  }

  function cacheElements() {
    els.searchInput = document.querySelector("#searchInput");
    els.sortSelect = document.querySelector("#sortSelect");
    els.onlyAvailable = document.querySelector("#onlyAvailable");
    els.categoryFilters = document.querySelector("#categoryFilters");
    els.categoryCards = document.querySelector("#categoryCards");
    els.navCategoryList = document.querySelector("#navCategoryList");
    els.navSellerList = document.querySelector("#navSellerList");
    els.featuredSection = document.querySelector("#featuredSection");
    els.featuredGrid = document.querySelector("#featuredGrid");
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
    els.heroWhatsappLink = document.querySelector("#heroWhatsappLink");
    els.productDialog = document.querySelector("#productDialog");
    els.dialogContent = document.querySelector("#dialogContent");
    els.dialogClose = document.querySelector("#dialogClose");
  }

  function bindEvents() {
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

    els.retryCatalog.addEventListener("click", () => {
      loadCatalog().then(renderAll);
    });

    els.clearFilters.addEventListener("click", () => {
      clearFilters();
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
        fetch("/api/catalog", { cache: "no-store" }),
        fetch("/api/products?limit=100", { cache: "no-store" }),
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
    renderNavigationMenus();
    renderSellers();
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
    els.heroWhatsappLink.href = heroSeller
      ? getWhatsAppUrl(heroSeller.phone, store.whatsappFallbackMessage || "")
      : "#catalogo";
    els.heroWhatsappLink.setAttribute("aria-label", "Hablar por WhatsApp con SmartShop");

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
            <span class="category-icon" aria-hidden="true">${escapeHtml(getCategoryInitials(category))}</span>
            <strong>${escapeHtml(category)}</strong>
            <small>${count} ${pluralize(count, "producto", "productos")}</small>
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
    els.resultCount.textContent = `${filteredProducts.length} ${pluralize(filteredProducts.length, "producto", "productos")}`;
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
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" width="760" height="570" onerror="this.parentElement.classList.add('image-fallback'); this.remove();">
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${escapeHtml(brand || product.category)}</span>
            <span>Codigo: ${escapeHtml(code)}</span>
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
            <span class="stock-pill ${stockStatus.className}">${stockStatus.label}: ${stock}</span>
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
            <a class="seller-link" href="${getWhatsAppUrl(seller.phone, message)}" target="_blank" rel="noopener">Hablar por WhatsApp</a>
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

  function clearFilters() {
    state.category = "Todos";
    state.onlyAvailable = false;
    state.search = "";
    els.searchInput.value = "";
    els.onlyAvailable.checked = false;
    renderCategories();
    renderProducts();
  }

  function getCategories() {
    return ["Todos", ...new Set(products.map((product) => product.category).filter(Boolean))];
  }

  function getVisibleProducts() {
    const search = normalizeText(state.search);
    return products
      .filter((product) => {
        const matchesCategory = state.category === "Todos" || product.category === state.category;
        const stock = getStock(product);
        const matchesAvailability = !state.onlyAvailable || stock > 0;
        const haystack = normalizeText(
          `${product.name} ${product.category} ${product.code} ${product.sku} ${product.brand} ${product.variant} ${product.description}`
        );
        return matchesCategory && matchesAvailability && haystack.includes(search);
      })
      .sort(sortProducts);
  }

  function sortProducts(a, b) {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "stock-desc") return getStock(b) - getStock(a);
    return Number(b.featured) - Number(a.featured) || getStock(b) - getStock(a);
  }

  function getStock(product) {
    return Number(product.stock) || 0;
  }

  function getStockStatus(stock) {
    if (stock <= 0) return { label: "Agotado", className: "is-sold-out" };
    if (stock <= 3) return { label: "Ultimas", className: "is-low-stock" };
    return { label: "Disponible", className: "is-available" };
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

  function getCategoryInitials(category) {
    return String(category || "")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
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
