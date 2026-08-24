(function () {
  const PLACE_ID_PLACEHOLDER = "TU_PLACE_ID_AQUI";
  const DEFAULT_ADDRESS =
    "Avda. Adrian Jara esquina Avda. Carlos Antonio Lopez, Galeria Jebai 4to piso, Ciudad del Este, Paraguay";
  const API_BASE_URL = String(
    window.SMARTSHOP_API_BASE_URL || localStorage.getItem("smartshop-api-base-url") || ""
  ).replace(/\/$/, "");
  const LANGUAGE_STORAGE_KEY = "smartshop-language";
  const TRANSLATION_CACHE_STORAGE_KEY = "smartshop-translation-cache-v1";
  const DEFAULT_LANGUAGE = "es";
  const CATEGORY_LABELS = {
    pt: {
      Todos: "Todos",
      Celulares: "Celulares",
      Audio: "Audio",
      Smartwatches: "Smartwatches",
      Gaming: "Gaming",
      Informatica: "Informatica",
      Informática: "Informatica",
      Accesorios: "Acessorios",
    },
  };
  const BRAND_LABELS = {
    pt: {
      Todas: "Todas",
    },
  };
  const TRANSLATIONS = {
    es: {
      "meta.title": "SmartShop | Catalogo con stock en Ciudad del Este",
      "meta.description":
        "SmartShop Ciudad del Este: celulares, tecnologia y accesorios con precio, stock actualizado, vendedores por WhatsApp, redes sociales y ubicacion en Google Maps.",
      "search.label": "Buscar producto",
      "search.placeholder": "Buscar productos, marcas o codigos...",
      "language.aria": "Idioma",
      "exchange.aria": "Cotizacion referencial",
      "nav.homeAria": "Ir al inicio",
      "nav.menuAria": "Abrir menu",
      "nav.sectionsAria": "Secciones principales",
      "nav.categoriesAria": "Categorias disponibles",
      "nav.sellersAria": "Vendedores disponibles",
      "nav.favoritesAria": "Favoritos",
      "nav.loginAria": "Iniciar sesion en el panel privado",
      "nav.cartAria": "Carrito",
      "nav.cartCountAria": "0 productos en carrito",
      "nav.home": "Inicio",
      "nav.category": "Categoria",
      "nav.offers": "Ofertas",
      "nav.sellers": "Vendedores",
      "nav.location": "Ubicacion",
      "nav.login": "Iniciar Sesion",
      "hero.title1": "Tecnologia que quieres.",
      "hero.title2": "Precios que te convienen.",
      "hero.lead":
        "Encuentra celulares, audio y accesorios con stock actualizado, precio claro y atencion directa por WhatsApp.",
      "hero.viewProducts": "Explorar productos",
      "hero.whatsapp": "Hablar por WhatsApp",
      "hero.trustAria": "Resumen de beneficios",
      "hero.trustStock": "Stock actualizado",
      "hero.trustPickup": "Retiro en CDE",
      "hero.trustSupport": "Atencion rapida",
      "hero.cardAria": "Productos destacados de SmartShop",
      "hero.cardTitle": "Catalogo SmartShop",
      "benefits.aria": "Beneficios de compra",
      "benefits.stockTitle": "Stock actualizado",
      "benefits.stockText": "Disponibilidad visible antes de consultar.",
      "benefits.pickupTitle": "Retiro en Ciudad del Este",
      "benefits.pickupText": "Coordina la compra y pasa por la tienda.",
      "benefits.whatsappTitle": "Atencion por WhatsApp",
      "benefits.whatsappText": "Consulta rapido con un vendedor.",
      "benefits.pricesTitle": "Precios transparentes",
      "benefits.pricesText": "Importes claros en dolares y conversiones.",
      "categories.eyebrow": "Explorar",
      "categories.title": "Categorias",
      "categories.copy": "Elige una linea y el catalogo se filtra automaticamente",
      "featured.eyebrow": "Seleccion SmartShop",
      "featured.title": "Productos destacados",
      "featured.copy": "Opciones con prioridad en el catalogo",
      "brands.eyebrow": "Marcas",
      "brands.title": "Compra por marca",
      "brands.copy": "Filtra por las marcas disponibles en el catalogo.",
      "catalog.eyebrow": "Catalogo",
      "catalog.title": "Productos",
      "catalog.filters": "Filtros",
      "catalog.sortLabel": "Ordenar productos",
      "catalog.sortFeatured": "Destacados primero",
      "catalog.sortName": "Nombre A-Z",
      "catalog.sortPriceAsc": "Menor precio",
      "catalog.sortPriceDesc": "Mayor precio",
      "catalog.sortStock": "Mas stock",
      "catalog.filtersAria": "Filtros del catalogo",
      "catalog.closeFiltersAria": "Cerrar filtros",
      "catalog.brand": "Marca",
      "catalog.priceUsd": "Precio USD",
      "catalog.from": "Desde",
      "catalog.to": "Hasta",
      "catalog.noLimit": "Sin limite",
      "catalog.onlyAvailable": "Mostrar solo disponibles",
      "catalog.clearFilters": "Limpiar filtros",
      "catalog.listTitle": "Listado",
      "catalog.emptyTitle": "No encontramos productos con estos filtros.",
      "catalog.emptyText": "Ajusta tu busqueda o vuelve a ver todo el catalogo.",
      "catalog.errorTitle": "No pudimos cargar el catalogo.",
      "catalog.errorText": "Revisa la conexion o intenta nuevamente.",
      "catalog.retry": "Reintentar",
      "stock.products": "Productos",
      "stock.units": "Unidades",
      "stock.soldOut": "Agotados",
      "sellers.eyebrow": "Atencion comercial",
      "sellers.title": "Necesitas ayuda para elegir?",
      "sellers.copy": "Habla directamente con nuestro equipo.",
      "sellers.prevAria": "Ver vendedores anteriores",
      "sellers.nextAria": "Ver mas vendedores",
      "location.eyebrow": "Ubicacion y redes",
      "location.title": "Visitanos",
      "location.copy": "SmartShop te espera en Galeria Jebai, 4to piso, Ciudad del Este.",
      "location.socialAria": "Redes sociales de SmartShop",
      "location.addressTitle": "Direccion",
      "location.mapTitle": "Mapa de SmartShop en Ciudad del Este",
      "location.directions": "Como llegar",
      "footer.copy": "Tecnologia y atencion directa en Ciudad del Este.",
      "footer.products": "Productos",
      "footer.catalog": "Catalogo",
      "footer.categories": "Categorias",
      "footer.offers": "Ofertas",
      "footer.help": "Ayuda",
      "footer.location": "Ubicacion",
      "footer.hours": "Horarios",
      "dialog.closeAria": "Cerrar detalle",
      "status.loadingCatalog": "Cargando catalogo",
      "status.preparingStock": "Preparando stock y precios",
      "status.notAvailable": "No disponible",
      "status.catalogUnavailable": "Catalogo no disponible",
      "status.retryLoad": "Intenta cargar nuevamente",
      "status.stockReady": "Stock listo para consultar",
      "status.withoutStock": "sin stock",
      "status.availableSingular": "disponible",
      "status.availablePlural": "disponibles",
      "status.soldOut": "Agotado",
      "status.lowStock": "Pocas unidades",
      "status.inStock": "En stock",
      "product.productSingular": "producto",
      "product.productPlural": "productos",
      "product.showing": "Mostrando",
      "product.of": "de",
      "product.consultWhatsapp": "Consultar por WhatsApp",
      "product.consultRestock": "Consultar reposicion",
      "product.addFavorite": "Agregar {name} a favoritos",
      "product.code": "Codigo",
      "product.view": "Ver producto",
      "product.brand": "Marca",
      "product.variant": "Variante",
      "product.status": "Estado",
      "product.conditionNew": "Nuevo",
      "product.warranty": "Garantia",
      "product.warrantyDefault": "Consultar con tienda",
      "product.delivery": "Entrega",
      "product.deliveryDefault": "Retiro en tienda o envio coordinado",
      "seller.photoAlt": "Foto de {name}",
      "seller.whatsapp": "Hablar por WhatsApp",
      "exchange.title": "Cotizacion referencial por 1 USD",
      "messages.product": "Producto",
      "messages.code": "Codigo",
      "messages.price": "Precio",
      "messages.approx": "Aprox",
      "messages.webStatus": "Estado web",
      "messages.web": "Web",
      "store.tagline": "Catalogo con stock actualizado",
    },
    pt: {
      "meta.title": "SmartShop | Catálogo com estoque em Ciudad del Este",
      "meta.description":
        "SmartShop Ciudad del Este: celulares, tecnologia e acessórios com preço, estoque atualizado, vendedores pelo WhatsApp, redes sociais e localização no Google Maps.",
      "search.label": "Buscar produto",
      "search.placeholder": "Buscar produtos, marcas ou códigos...",
      "language.aria": "Idioma",
      "exchange.aria": "Cotação referencial",
      "nav.homeAria": "Ir para o início",
      "nav.menuAria": "Abrir menu",
      "nav.sectionsAria": "Seções principais",
      "nav.categoriesAria": "Categorias disponíveis",
      "nav.sellersAria": "Vendedores disponíveis",
      "nav.favoritesAria": "Favoritos",
      "nav.loginAria": "Entrar no painel privado",
      "nav.cartAria": "Carrinho",
      "nav.cartCountAria": "0 produtos no carrinho",
      "nav.home": "Inicio",
      "nav.category": "Categoria",
      "nav.offers": "Ofertas",
      "nav.sellers": "Vendedores",
      "nav.location": "Localização",
      "nav.login": "Entrar",
      "hero.title1": "Tecnologia que você quer.",
      "hero.title2": "Preços que compensam.",
      "hero.lead":
        "Encontre celulares, áudio e acessórios com estoque atualizado, preço claro e atendimento direto pelo WhatsApp.",
      "hero.viewProducts": "Ver produtos",
      "hero.whatsapp": "Falar no WhatsApp",
      "hero.trustAria": "Resumo de benefícios",
      "hero.trustStock": "Estoque atualizado",
      "hero.trustPickup": "Retirada em CDE",
      "hero.trustSupport": "Atendimento rápido",
      "hero.cardAria": "Produtos em destaque da SmartShop",
      "hero.cardTitle": "Catálogo SmartShop",
      "benefits.aria": "Benefícios de compra",
      "benefits.stockTitle": "Estoque atualizado",
      "benefits.stockText": "Disponibilidade visível antes de consultar.",
      "benefits.pickupTitle": "Retirada em Ciudad del Este",
      "benefits.pickupText": "Combine a compra e passe pela loja.",
      "benefits.whatsappTitle": "Atendimento pelo WhatsApp",
      "benefits.whatsappText": "Consulte rapidamente com um vendedor.",
      "benefits.pricesTitle": "Preços transparentes",
      "benefits.pricesText": "Valores claros em dólares e conversões.",
      "categories.eyebrow": "Explorar",
      "categories.title": "Categorias",
      "categories.copy": "Escolha uma linha e o catálogo será filtrado automaticamente",
      "featured.eyebrow": "Seleção SmartShop",
      "featured.title": "Produtos em destaque",
      "featured.copy": "Opções com prioridade no catálogo",
      "brands.eyebrow": "Marcas",
      "brands.title": "Comprar por marca",
      "brands.copy": "Filtre pelas marcas disponíveis no catálogo.",
      "catalog.eyebrow": "Catálogo",
      "catalog.title": "Produtos",
      "catalog.filters": "Filtros",
      "catalog.sortLabel": "Ordenar produtos",
      "catalog.sortFeatured": "Destaques primeiro",
      "catalog.sortName": "Nome A-Z",
      "catalog.sortPriceAsc": "Menor preço",
      "catalog.sortPriceDesc": "Maior preço",
      "catalog.sortStock": "Mais estoque",
      "catalog.filtersAria": "Filtros do catálogo",
      "catalog.closeFiltersAria": "Fechar filtros",
      "catalog.brand": "Marca",
      "catalog.priceUsd": "Preço USD",
      "catalog.from": "De",
      "catalog.to": "Até",
      "catalog.noLimit": "Sem limite",
      "catalog.onlyAvailable": "Mostrar somente disponíveis",
      "catalog.clearFilters": "Limpar filtros",
      "catalog.listTitle": "Lista",
      "catalog.emptyTitle": "Não encontramos produtos com estes filtros.",
      "catalog.emptyText": "Ajuste sua busca ou volte a ver todo o catálogo.",
      "catalog.errorTitle": "Não conseguimos carregar o catálogo.",
      "catalog.errorText": "Verifique a conexão ou tente novamente.",
      "catalog.retry": "Tentar novamente",
      "stock.products": "Produtos",
      "stock.units": "Unidades",
      "stock.soldOut": "Esgotados",
      "sellers.eyebrow": "Atendimento comercial",
      "sellers.title": "Precisa de ajuda para escolher?",
      "sellers.copy": "Fale diretamente com nossa equipe.",
      "sellers.prevAria": "Ver vendedores anteriores",
      "sellers.nextAria": "Ver mais vendedores",
      "location.eyebrow": "Localização e redes",
      "location.title": "Visite-nos",
      "location.copy": "A SmartShop espera por você na Galeria Jebai, 4º piso, Ciudad del Este.",
      "location.socialAria": "Redes sociais da SmartShop",
      "location.addressTitle": "Endereço",
      "location.mapTitle": "Mapa da SmartShop em Ciudad del Este",
      "location.directions": "Como chegar",
      "footer.copy": "Tecnologia e atendimento direto em Ciudad del Este.",
      "footer.products": "Produtos",
      "footer.catalog": "Catálogo",
      "footer.categories": "Categorias",
      "footer.offers": "Ofertas",
      "footer.help": "Ajuda",
      "footer.location": "Localização",
      "footer.hours": "Horários",
      "dialog.closeAria": "Fechar detalhe",
      "status.loadingCatalog": "Carregando catálogo",
      "status.preparingStock": "Preparando estoque e preços",
      "status.notAvailable": "Não disponível",
      "status.catalogUnavailable": "Catálogo não disponível",
      "status.retryLoad": "Tente carregar novamente",
      "status.stockReady": "Estoque pronto para consultar",
      "status.withoutStock": "sem estoque",
      "status.availableSingular": "disponível",
      "status.availablePlural": "disponíveis",
      "status.soldOut": "Esgotado",
      "status.lowStock": "Poucas unidades",
      "status.inStock": "Em estoque",
      "product.productSingular": "produto",
      "product.productPlural": "produtos",
      "product.showing": "Mostrando",
      "product.of": "de",
      "product.consultWhatsapp": "Consultar pelo WhatsApp",
      "product.consultRestock": "Consultar reposição",
      "product.addFavorite": "Adicionar {name} aos favoritos",
      "product.code": "Código",
      "product.view": "Ver produto",
      "product.brand": "Marca",
      "product.variant": "Variante",
      "product.status": "Estado",
      "product.conditionNew": "Novo",
      "product.warranty": "Garantia",
      "product.warrantyDefault": "Consultar com a loja",
      "product.delivery": "Entrega",
      "product.deliveryDefault": "Retirada na loja ou envio combinado",
      "seller.photoAlt": "Foto de {name}",
      "seller.whatsapp": "Falar no WhatsApp",
      "exchange.title": "Cotação referencial por 1 USD",
      "messages.product": "Produto",
      "messages.code": "Código",
      "messages.price": "Preço",
      "messages.approx": "Aprox",
      "messages.webStatus": "Status no site",
      "messages.web": "Site",
      "store.tagline": "Catálogo com estoque atualizado",
    },
  };

  const baseData = window.STORE_DATA || {};
  let data = normalizeCatalog(baseData);
  let store = data.store;
  let products = data.products;
  let sellers = data.sellers;
  const translationCache = loadTranslationCache();
  let productTranslationPromise = null;

  const state = {
    language: getInitialLanguage(),
    category: "Todos",
    onlyAvailable: false,
    brand: "Todas",
    minPrice: "",
    maxPrice: "",
    search: "",
    sort: "featured",
    loading: true,
    error: "",
    dialogProductId: "",
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    hydrateStaticIcons();
    bindEvents();
    applyTranslations();
    renderAll();
    await loadCatalog();
    renderAll();
  }

  function cacheElements() {
    els.searchInput = document.querySelector("#searchInput");
    els.mobileMenuToggle = document.querySelector("#mobileMenuToggle");
    els.languageButtons = Array.from(document.querySelectorAll("[data-language-option]"));
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
    els.exchangeTicker = document.querySelector("#exchangeTicker");
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
    els.languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setLanguage(button.dataset.languageOption);
      });
    });

    els.mobileMenuToggle.addEventListener("click", () => {
      const isOpen = els.siteNav.classList.toggle("is-open");
      els.mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    els.siteNav.addEventListener("click", (event) => {
      const mobileDropdownLink = event.target.closest(".nav-menu > a");
      if (mobileDropdownLink && window.matchMedia("(max-width: 960px)").matches) {
        event.preventDefault();
        const menu = mobileDropdownLink.closest(".nav-menu");
        const isOpen = menu.classList.toggle("is-open");
        mobileDropdownLink.setAttribute("aria-expanded", String(isOpen));
        return;
      }
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
      if (button) {
        setCategory(button.dataset.category, true);
        closeMobileMenu();
      }
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

  function getInitialLanguage() {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "pt" || saved === "es") return saved;
    const browserLanguage = String(window.navigator?.language || "").toLowerCase();
    return browserLanguage.startsWith("pt") ? "pt" : DEFAULT_LANGUAGE;
  }

  function setLanguage(language) {
    if (!TRANSLATIONS[language] || state.language === language) return;
    state.language = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    applyTranslations();
    renderAll();
    queueProductTranslations();
  }

  function t(key, replacements = {}) {
    const dictionary = TRANSLATIONS[state.language] || TRANSLATIONS[DEFAULT_LANGUAGE];
    const fallback = TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;
    return Object.entries(replacements).reduce((text, [name, value]) => {
      return text.replaceAll(`{${name}}`, String(value));
    }, dictionary[key] || fallback);
  }

  function applyTranslations() {
    document.documentElement.lang = state.language;
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", t("meta.title"));
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.setAttribute("title", t(node.dataset.i18nTitle));
    });
    els.languageButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.languageOption === state.language);
      button.setAttribute("aria-pressed", String(button.dataset.languageOption === state.language));
    });
  }

  function loadTranslationCache() {
    try {
      const raw = localStorage.getItem(TRANSLATION_CACHE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveTranslationCache() {
    try {
      const entries = Object.entries(translationCache).slice(-800);
      localStorage.setItem(TRANSLATION_CACHE_STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
    } catch {
      // Local storage can be unavailable in private browsing; translation still works for the session.
    }
  }

  async function loadCatalog() {
    state.loading = true;
    state.error = "";
    renderProducts();
    try {
      if (window.SmartShopSupabase?.isConfigured()) {
        data = normalizeCatalog(await window.SmartShopSupabase.loadPublicCatalog());
        return;
      }
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
      if (window.SmartShopSupabase?.isConfigured()) {
        data = normalizeCatalog({ store: baseData.store, products: [], sellers: [] });
        state.error = t("catalog.errorTitle");
      } else {
        data = normalizeCatalog(baseData);
        if (!data.products.length) {
          state.error = t("catalog.errorTitle");
        }
      }
    } finally {
      store = data.store;
      products = data.products;
      sellers = data.sellers;
      state.loading = false;
      queueProductTranslations();
    }
  }

  function renderAll() {
    applyTranslations();
    renderStoreInfo();
    renderCategories();
    renderBrands();
    renderNavigationMenus();
    renderSellers();
    renderHeroShowcase();
    renderFeaturedProducts();
    renderProducts();
    injectStructuredData();
    queueProductTranslations();
  }

  function renderStoreInfo() {
    const social = store.social || {};
    const socialUsername = social.username || "@smartshopcde";
    const address = store.address || DEFAULT_ADDRESS;
    const hours = store.hours || "Lunes a Sabado: 7:30 a 15:30";
    const mapsUrl = getMapsUrl(address);
    const directionsUrl = getDirectionsUrl(address);
    const heroSeller = sellers.find((seller) => seller.phone) || sellers[0];

    document.querySelectorAll("[data-store-name]").forEach((node) => {
      node.textContent = store.name || "SmartShop";
    });
    document.querySelectorAll("[data-store-tagline]").forEach((node) => {
      node.textContent = store.tagline || t("store.tagline");
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
      ? getWhatsAppUrl(heroSeller.phone, buildSellerMessage(heroSeller))
      : "#catalogo";
    els.heroWhatsappLink.setAttribute("aria-label", `${t("hero.whatsapp")} SmartShop`);
    els.floatingWhatsapp.href = els.heroWhatsappLink.href;
    renderExchangeTicker();

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
            ${escapeHtml(getCategoryLabel(category))}
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
            <strong>${escapeHtml(getCategoryLabel(category))}</strong>
            <small>${count} ${pluralize(count, t("product.productSingular"), t("product.productPlural"))} <span aria-hidden="true">&rarr;</span></small>
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
            ${escapeHtml(getBrandLabel(brand))}
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
            ${escapeHtml(getBrandLabel(brand))}
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
            <span>${escapeHtml(getCategoryLabel(category))}</span>
            <small>${category === "Todos" ? products.length : products.filter((product) => product.category === category).length}</small>
          </button>
        `
      )
      .join("");

    els.navSellerList.innerHTML = sellers
      .map(
        (seller) => `
          <a href="${getWhatsAppUrl(seller.phone, buildSellerMessage(seller))}" target="_blank" rel="noopener">
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
      : `<img class="hero-logo-fallback" src="assets/logo-smartshop.png" width="160" height="160" alt="">`;
  }

  function queueProductTranslations() {
    if (state.language !== "pt" || state.loading || state.error || productTranslationPromise) return;
    const texts = collectTranslatableProductTexts().filter((text) => !translationCache[translationCacheKey(text)]);
    if (!texts.length) return;

    productTranslationPromise = translateTexts(texts, { source: "es", target: "pt" })
      .then((translations) => {
        texts.forEach((text, index) => {
          const translated = translations[index];
          if (translated) translationCache[translationCacheKey(text)] = translated;
        });
        saveTranslationCache();
        renderFeaturedProducts();
        renderProducts();
        if (state.dialogProductId) {
          const product = products.find((item) => item.id === state.dialogProductId);
          if (product && els.productDialog.open) openProductDialog(product);
        }
      })
      .catch((error) => {
        console.warn("No se pudo traducir el catalogo con Google Translate.", error);
      })
      .finally(() => {
        productTranslationPromise = null;
      });
  }

  function collectTranslatableProductTexts() {
    const texts = new Set();
    products.forEach((product) => {
      addTranslatableText(texts, product.description);
      getProductDetails(product).forEach((detail) => addTranslatableText(texts, detail));
      addTranslatableText(texts, product.condition);
      addTranslatableText(texts, product.warranty);
      addTranslatableText(texts, product.delivery);
    });
    sellers.forEach((seller) => {
      addTranslatableText(texts, seller.role);
      addTranslatableText(texts, seller.schedule);
    });
    return Array.from(texts);
  }

  function addTranslatableText(texts, value) {
    const text = String(value || "").trim();
    if (!text || text.length < 4 || /^[\d\s.,/%+-]+$/.test(text)) return;
    texts.add(text);
  }

  async function translateTexts(texts, options) {
    const batches = [];
    for (let index = 0; index < texts.length; index += 80) {
      batches.push(texts.slice(index, index + 80));
    }

    const translated = [];
    for (const batch of batches) {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: options.source,
          target: options.target,
          texts: batch,
        }),
      });
      if (!response.ok) throw new Error(`Translate API ${response.status}`);
      const payload = await response.json();
      if (!payload.success || !Array.isArray(payload.data?.translations)) {
        throw new Error("Respuesta de traduccion invalida");
      }
      translated.push(...payload.data.translations);
    }
    return translated;
  }

  function getTranslatedText(value) {
    const text = String(value || "");
    if (state.language !== "pt" || !text.trim()) return text;
    return translationCache[translationCacheKey(text)] || text;
  }

  function translationCacheKey(value) {
    return `pt:${String(value || "").trim()}`;
  }

  function renderProducts() {
    if (!els.productGrid) return;

    if (state.loading) {
      els.productGrid.setAttribute("aria-busy", "true");
      els.productGrid.innerHTML = renderSkeletonCards(6);
      els.catalogError.hidden = true;
      els.emptyState.hidden = true;
      els.stockSummary.hidden = true;
      els.resultCount.textContent = t("status.loadingCatalog");
      els.availableProducts.textContent = t("status.loadingCatalog");
      els.stockHealth.textContent = t("status.preparingStock");
      return;
    }

    if (state.error) {
      els.productGrid.setAttribute("aria-busy", "false");
      els.productGrid.innerHTML = "";
      els.catalogError.hidden = false;
      els.emptyState.hidden = true;
      els.stockSummary.hidden = true;
      els.resultCount.textContent = t("status.notAvailable");
      els.availableProducts.textContent = t("status.catalogUnavailable");
      els.stockHealth.textContent = t("status.retryLoad");
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
        ? `${products.length} ${pluralize(products.length, t("product.productSingular"), t("product.productPlural"))}`
        : `${t("product.showing")} ${filteredProducts.length} ${t("product.of")} ${products.length}`;
    els.availableProducts.textContent = `${availableCount} ${pluralize(
      availableCount,
      t("status.availableSingular"),
      t("status.availablePlural")
    )}`;
    els.stockHealth.textContent =
      soldOutCount > 0 ? `${soldOutCount} ${t("status.withoutStock")}` : t("status.stockReady");
    els.totalProducts.textContent = products.length;
    els.totalUnits.textContent = totalUnits;
    els.soldOutProducts.textContent = soldOutCount;
  }

  function renderProductCard(product, options = {}) {
    const stock = getStock(product);
    const stockStatus = getStockStatus(stock);
    const seller = getRandomSeller();
    const whatsappUrl = seller ? getWhatsAppUrl(seller.phone, buildProductMessage(product, stock, seller)) : "#";
    const actionText = stock > 0 ? t("product.consultWhatsapp") : t("product.consultRestock");
    const code = getProductCode(product);
    const brand = product.brand || "";
    const variant = product.variant || "";
    const description = getTranslatedText(product.description);

    return `
      <article class="product-card ${stockStatus.className}${options.compact ? " is-compact" : ""}">
        <div class="product-image">
          ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}
          <button class="wishlist-button" type="button" aria-label="${escapeHtml(t("product.addFavorite", { name: product.name }))}">${iconSvg("heart")}</button>
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async" width="760" height="760" onerror="this.parentElement.classList.add('image-fallback'); this.remove();">
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${escapeHtml(brand || getCategoryLabel(product.category))}</span>
          </div>
          <h3>${escapeHtml(product.name)}</h3>
          ${variant ? `<p class="product-variant">${escapeHtml(variant)}</p>` : ""}
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          <ul class="product-specs">
            ${getProductDetails(product)
              .slice(0, 3)
              .map((detail) => `<li>${escapeHtml(getTranslatedText(detail))}</li>`)
              .join("")}
          </ul>
          <div class="price-row">
            ${renderPriceBlock(product.price)}
          </div>
          <div class="product-foot">
            <span class="product-code">${t("product.code")}: ${escapeHtml(code)}</span>
            <span class="stock-pill ${stockStatus.className}"><span aria-hidden="true"></span>${stockStatus.label}</span>
          </div>
          <div class="product-actions">
            <button class="ghost-button" type="button" data-product-detail data-id="${escapeHtml(product.id)}">${t("product.view")}</button>
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
        return `
          <article class="seller-card">
            <img class="seller-photo" src="${escapeHtml(seller.image)}" alt="${escapeHtml(t("seller.photoAlt", { name: seller.name }))}" loading="lazy" decoding="async" onerror="this.src='assets/logo-smartshop.png';">
            <div>
              ${seller.role ? `<span class="seller-role">${escapeHtml(getTranslatedText(seller.role))}</span>` : ""}
              <h3>${escapeHtml(seller.name)}</h3>
              ${seller.schedule ? `<p>${escapeHtml(getTranslatedText(seller.schedule))}</p>` : ""}
            </div>
            <a class="seller-link" href="${getWhatsAppUrl(seller.phone, buildSellerMessage(seller))}" target="_blank" rel="noopener">
              ${iconSvg("message-circle")}
              ${t("seller.whatsapp")}
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
    state.dialogProductId = product.id;
    const stock = getStock(product);
    const stockStatus = getStockStatus(stock);
    const details = getProductDetails(product);
    const description = getTranslatedText(product.description);
    const sellerButtons = sellers
      .map(
        (seller) => `
          <a class="seller-link" href="${getWhatsAppUrl(seller.phone, buildProductMessage(product, stock, seller))}" target="_blank" rel="noopener">
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
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          <div class="price-row">
            ${renderPriceBlock(product.price)}
            <span class="stock-pill ${stockStatus.className}">${stockStatus.label}</span>
          </div>
          <dl class="detail-list">
            <div><dt>${t("product.code")}</dt><dd>${escapeHtml(getProductCode(product))}</dd></div>
            ${product.brand ? `<div><dt>${t("product.brand")}</dt><dd>${escapeHtml(product.brand)}</dd></div>` : ""}
            ${product.variant ? `<div><dt>${t("product.variant")}</dt><dd>${escapeHtml(product.variant)}</dd></div>` : ""}
            <div><dt>${t("product.status")}</dt><dd>${escapeHtml(product.condition ? getTranslatedText(product.condition) : t("product.conditionNew"))}</dd></div>
            <div><dt>${t("product.warranty")}</dt><dd>${escapeHtml(product.warranty ? getTranslatedText(product.warranty) : t("product.warrantyDefault"))}</dd></div>
            <div><dt>${t("product.delivery")}</dt><dd>${escapeHtml(product.delivery ? getTranslatedText(product.delivery) : t("product.deliveryDefault"))}</dd></div>
          </dl>
          <ul class="product-specs is-large">${details.map((detail) => `<li>${escapeHtml(getTranslatedText(detail))}</li>`).join("")}</ul>
          <div class="dialog-actions">${sellerButtons}</div>
        </div>
      </div>
    `;

    if (els.productDialog.open) {
      return;
    }
    if (typeof els.productDialog.showModal === "function") {
      els.productDialog.showModal();
    } else {
      els.productDialog.setAttribute("open", "");
    }
  }

  function closeProductDialog() {
    state.dialogProductId = "";
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

  function getCategoryLabel(category) {
    return CATEGORY_LABELS[state.language]?.[category] || category;
  }

  function getBrands() {
    return ["Todas", ...new Set(products.map((product) => product.brand).filter(Boolean))];
  }

  function getBrandLabel(brand) {
    return BRAND_LABELS[state.language]?.[brand] || brand;
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
          `${product.name} ${product.category} ${getCategoryLabel(product.category)} ${product.code} ${product.sku} ${product.brand} ${product.variant} ${product.description} ${getTranslatedText(product.description)}`
        );
        return matchesCategory && matchesBrand && matchesAvailability && matchesPrice && haystack.includes(search);
      })
      .sort(sortProducts);
  }

  function sortProducts(a, b) {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "stock-desc") return getStock(b) - getStock(a);
    if (state.sort === "name-asc") return a.name.localeCompare(b.name, state.language);
    return Number(b.featured) - Number(a.featured) || getStock(b) - getStock(a);
  }

  function getStock(product) {
    return Number(product.stock) || 0;
  }

  function getStockStatus(stock) {
    if (stock <= 0) return { label: t("status.soldOut"), className: "is-sold-out" };
    if (stock <= 3) return { label: t("status.lowStock"), className: "is-low-stock" };
    return { label: t("status.inStock"), className: "is-available" };
  }

  function getProductCode(product) {
    return product.code || product.sku || "";
  }

  function getProductDetails(product) {
    return Array.isArray(product.details) && product.details.length
      ? product.details
      : [product.variant, product.condition, product.warranty, product.delivery].filter(Boolean);
  }

  function buildSellerMessage(seller) {
    const sellerName = getSellerGreetingName(seller);
    return [
      `Olá, ${sellerName}!`,
      "Gostaria de consultar sobre um produto.",
      "",
      `¡Hola, ${sellerName}!`,
      "Me gustaría consultar sobre un producto.",
    ].join("\n");
  }

  function buildProductMessage(product, stock, seller) {
    const stockStatus = getStockStatus(stock);
    const pieces = [
      buildSellerMessage(seller),
      `${t("messages.product")}: ${product.name}`,
      `${t("messages.code")}: ${getProductCode(product)}`,
      `${t("messages.price")}: ${formatPrice(product.price)}`,
      `${t("messages.approx")}: ${formatGuaraniPrice(convertUsdToPyg(product.price))} / ${formatRealPrice(convertUsdToBrl(product.price))}`,
      `${t("messages.webStatus")}: ${stockStatus.label}`,
    ];
    if (store.domain) pieces.push(`${t("messages.web")}: https://${store.domain}`);
    return pieces.join("\n");
  }

  function getRandomSeller() {
    const availableSellers = sellers.filter((seller) => seller.phone);
    if (!availableSellers.length) return null;
    const index = Math.floor(Math.random() * availableSellers.length);
    return availableSellers[index];
  }

  function getSellerGreetingName(seller) {
    return String(seller?.name || store.name || "SmartShop").trim();
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
    return formatUsdPrice(value);
  }

  function renderPriceBlock(value) {
    return `
      <div class="price-stack">
        <strong>${formatUsdPrice(value)}</strong>
        <small>${formatGuaraniPrice(convertUsdToPyg(value))} · ${formatRealPrice(convertUsdToBrl(value))}</small>
      </div>
    `;
  }

  function renderExchangeTicker() {
    if (!els.exchangeTicker) return;
    const rates = getExchangeRates();
    els.exchangeTicker.innerHTML = `
      <span>
        <img class="currency-flag" src="assets/flag-brazil.svg" width="24" height="16" alt="Brasil">
        ${formatRateBrl(rates.usdToBrl)} R$
      </span>
      <span class="exchange-separator" aria-hidden="true">|</span>
      <span>
        <img class="currency-flag" src="assets/flag-paraguay.svg" width="24" height="16" alt="Paraguay">
        ${formatRatePyg(rates.usdToPyg)} G$
      </span>
    `;
    els.exchangeTicker.title = t("exchange.title");
  }

  function getExchangeRates() {
    const rates = store.exchangeRates || {};
    const usdToBrl = Number(rates.usdToBrl ?? rates.usd_to_brl ?? 5.27);
    const usdToPyg = Number(rates.usdToPyg ?? rates.usd_to_pyg ?? 6100);
    return {
      usdToBrl: Number.isFinite(usdToBrl) && usdToBrl > 0 ? usdToBrl : 5.27,
      usdToPyg: Number.isFinite(usdToPyg) && usdToPyg > 0 ? usdToPyg : 6100,
    };
  }

  function convertUsdToBrl(value) {
    return (Number(value) || 0) * getExchangeRates().usdToBrl;
  }

  function convertUsdToPyg(value) {
    return (Number(value) || 0) * getExchangeRates().usdToPyg;
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
        priceCurrency: "USD",
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
