(function () {
  const PLACE_ID_PLACEHOLDER = "TU_PLACE_ID_AQUI";
  const DEFAULT_ADDRESS =
    "Avda. Adrian Jara esquina Avda. Carlos Antonio Lopez, Galeria Jebai 4to piso, Ciudad del Este, Paraguay";
  const API_BASE_URL = String(
    window.SMARTSHOP_API_BASE_URL || localStorage.getItem("smartshop-api-base-url") || ""
  ).replace(/\/$/, "");
  const LANGUAGE_STORAGE_KEY = "smartshop-language";
  const TRANSLATION_CACHE_STORAGE_KEY = "smartshop-translation-cache-v2";
  const CART_STORAGE_KEY = "smartshop-cart-v1";
  const DEFAULT_LANGUAGE = "es";
  const HERO_SLIDES = [
    "assets/hero-slides/slide-01.png",
    "assets/hero-slides/slide-02.png",
    "assets/hero-slides/slide-03.png",
    "assets/hero-slides/slide-04.png",
    "assets/hero-slides/slide-05.png",
    "assets/hero-slides/slide-06.png",
    "assets/hero-slides/slide-07.png",
    "assets/hero-slides/slide-08.png",
  ];
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
      "orders.eyebrow": "Seguimiento",
      "orders.title": "Consulta tu pedido",
      "orders.copy": "Ingresa el numero de pedido y tu WhatsApp para ver el estado.",
      "orders.numberLabel": "Numero de pedido",
      "orders.whatsappLabel": "WhatsApp",
      "orders.checkStatus": "Consultar estado",
      "orders.notFound": "No encontramos un pedido con esos datos.",
      "orders.statusPrefix": "Estado",
      "orders.createdAt": "Pedido creado",
      "orders.items": "Productos del pedido",
      "orders.total": "Total",
      "cart.closeAria": "Cerrar carrito",
      "cart.eyebrow": "Carrito",
      "cart.title": "Tu pedido SmartShop",
      "cart.copy": "Agrega productos y envia la solicitud para que nuestro equipo confirme disponibilidad.",
      "cart.emptyTitle": "Tu carrito esta vacio.",
      "cart.emptyText": "Elige productos del catalogo para preparar tu pedido.",
      "cart.goCatalog": "Ver catalogo",
      "cart.add": "Agregar al carrito",
      "cart.added": "Producto agregado al carrito.",
      "cart.remove": "Quitar",
      "cart.quantity": "Cantidad",
      "cart.subtotal": "Subtotal",
      "cart.nameLabel": "Nombre",
      "cart.whatsappLabel": "WhatsApp",
      "cart.notesLabel": "Nota opcional",
      "cart.notesPlaceholder": "Ej: Paso a retirar hoy por la tarde.",
      "cart.submit": "Enviar pedido",
      "cart.sending": "Enviando pedido...",
      "cart.successTitle": "Pedido recibido",
      "cart.successCopy": "Guarda este numero para consultar el estado.",
      "cart.error": "No pudimos crear el pedido.",
      "cart.stockLimit": "No hay mas stock disponible para este producto.",
      "hero.title1": "Descubrí una manera Smart",
      "hero.title2": "para comprar",
      "hero.lead":
        "Tecnología, asesoramiento y atención personalizada para encontrar la mejor opción para vos.",
      "hero.viewProducts": "Explorar productos",
      "hero.whatsapp": "Hablar por WhatsApp",
      "hero.trustAria": "Resumen de beneficios",
      "hero.trustStock": "Atención rápida",
      "hero.trustPickup": "Retiro en tienda",
      "hero.trustSupport": "Garantía y seguridad",
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
      "catalog.viewAria": "Vista del catalogo",
      "catalog.viewCards": "Cards",
      "catalog.viewList": "Lista",
      "catalog.listTitle": "Listado",
      "catalog.emptyTitle": "No encontramos productos con estos filtros.",
      "catalog.emptyText": "Ajusta tu busqueda o vuelve a ver todo el catalogo.",
      "catalog.searchEmptyTitle": "No hay productos para esa busqueda.",
      "catalog.searchEmptyText": "Prueba con otro nombre, marca o codigo.",
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
      "location.defaultHours": "Lunes a Sabado: 7:30 a 15:30",
      "location.mapTitle": "Mapa de SmartShop en Ciudad del Este",
      "location.directions": "Como llegar",
      "footer.copy": "Tecnologia y atencion directa en Ciudad del Este.",
      "footer.products": "Productos",
      "footer.catalog": "Catalogo",
      "footer.categories": "Categorias",
      "footer.offers": "Ofertas",
      "footer.help": "Ayuda",
      "footer.orders": "Estado de pedido",
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
      "product.addCart": "Agregar",
      "product.addFavorite": "Agregar {name} a favoritos",
      "product.code": "Codigo",
      "product.view": "Ver producto",
      "product.brand": "Marca",
      "product.variant": "Variante",
      "product.availableVariants": "Variantes disponibles",
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
      "orderStatus.new": "Recibido",
      "orderStatus.confirmed": "Confirmado",
      "orderStatus.preparing": "En preparacion",
      "orderStatus.ready": "Listo para retirar",
      "orderStatus.delivered": "Entregado",
      "orderStatus.cancelled": "Cancelado",
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
      "orders.eyebrow": "Acompanhamento",
      "orders.title": "Consulte seu pedido",
      "orders.copy": "Informe o numero do pedido e seu WhatsApp para ver o estado.",
      "orders.numberLabel": "Numero do pedido",
      "orders.whatsappLabel": "WhatsApp",
      "orders.checkStatus": "Consultar estado",
      "orders.notFound": "Não encontramos um pedido com esses dados.",
      "orders.statusPrefix": "Estado",
      "orders.createdAt": "Pedido criado",
      "orders.items": "Produtos do pedido",
      "orders.total": "Total",
      "cart.closeAria": "Fechar carrinho",
      "cart.eyebrow": "Carrinho",
      "cart.title": "Seu pedido SmartShop",
      "cart.copy": "Adicione produtos e envie a solicitação para nossa equipe confirmar a disponibilidade.",
      "cart.emptyTitle": "Seu carrinho esta vazio.",
      "cart.emptyText": "Escolha produtos do catálogo para preparar seu pedido.",
      "cart.goCatalog": "Ver catalogo",
      "cart.add": "Adicionar ao carrinho",
      "cart.added": "Produto adicionado ao carrinho.",
      "cart.remove": "Remover",
      "cart.quantity": "Quantidade",
      "cart.subtotal": "Subtotal",
      "cart.nameLabel": "Nome",
      "cart.whatsappLabel": "WhatsApp",
      "cart.notesLabel": "Observação opcional",
      "cart.notesPlaceholder": "Ex: Passo para retirar hoje à tarde.",
      "cart.submit": "Enviar pedido",
      "cart.sending": "Enviando pedido...",
      "cart.successTitle": "Pedido recebido",
      "cart.successCopy": "Guarde este numero para consultar o estado.",
      "cart.error": "Não conseguimos criar o pedido.",
      "cart.stockLimit": "Não há mais estoque disponível para este produto.",
      "hero.title1": "Descubra uma forma Smart",
      "hero.title2": "de comprar",
      "hero.lead":
        "Tecnologia, assessoria e atendimento personalizado para encontrar a melhor opção para você.",
      "hero.viewProducts": "Ver produtos",
      "hero.whatsapp": "Falar no WhatsApp",
      "hero.trustAria": "Resumo de benefícios",
      "hero.trustStock": "Atendimento rápido",
      "hero.trustPickup": "Retirada na loja",
      "hero.trustSupport": "Garantia e segurança",
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
      "catalog.viewAria": "Vista do catálogo",
      "catalog.viewCards": "Cards",
      "catalog.viewList": "Lista",
      "catalog.listTitle": "Lista",
      "catalog.emptyTitle": "Não encontramos produtos com estes filtros.",
      "catalog.emptyText": "Ajuste sua busca ou volte a ver todo o catálogo.",
      "catalog.searchEmptyTitle": "Não há produtos para essa busca.",
      "catalog.searchEmptyText": "Tente outro nome, marca ou código.",
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
      "location.defaultHours": "Segunda a sábado: 7:30 às 15:30",
      "location.mapTitle": "Mapa da SmartShop em Ciudad del Este",
      "location.directions": "Como chegar",
      "footer.copy": "Tecnologia e atendimento direto em Ciudad del Este.",
      "footer.products": "Produtos",
      "footer.catalog": "Catálogo",
      "footer.categories": "Categorias",
      "footer.offers": "Ofertas",
      "footer.help": "Ajuda",
      "footer.orders": "Estado do pedido",
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
      "product.addCart": "Adicionar",
      "product.addFavorite": "Adicionar {name} aos favoritos",
      "product.code": "Código",
      "product.view": "Ver produto",
      "product.brand": "Marca",
      "product.variant": "Variante",
      "product.availableVariants": "Variantes disponíveis",
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
      "orderStatus.new": "Recebido",
      "orderStatus.confirmed": "Confirmado",
      "orderStatus.preparing": "Em preparação",
      "orderStatus.ready": "Pronto para retirar",
      "orderStatus.delivered": "Entregue",
      "orderStatus.cancelled": "Cancelado",
    },
  };

  const baseData = window.STORE_DATA || {};
  let data = normalizeCatalog(baseData);
  let store = data.store;
  let products = data.products;
  let sellers = data.sellers;
  const translationCache = loadTranslationCache();
  let productTranslationPromise = null;
  let searchTimer = 0;
  let searchRequestId = 0;
  let heroSliderTimer = 0;

  redirectAuthCallbackToAdmin();

  const state = {
    language: getInitialLanguage(),
    cart: loadCart(),
    category: "Todos",
    onlyAvailable: false,
    brand: "Todas",
    minPrice: "",
    maxPrice: "",
    search: "",
    sort: "featured",
    viewMode: "cards",
    loading: true,
    error: "",
    dialogProductId: "",
    searchScrolled: false,
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function redirectAuthCallbackToAdmin() {
    const params = getAuthCallbackParams();
    const type = String(params.get("type") || "").toLowerCase();
    if (!["invite", "recovery"].includes(type) || window.location.pathname.startsWith("/admin")) return;
    window.location.replace(`/admin${window.location.search || ""}${window.location.hash || ""}`);
  }

  function getAuthCallbackParams() {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    hash.forEach((value, key) => params.set(key, value));
    return params;
  }

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
    els.viewModeButtons = Array.from(document.querySelectorAll("[data-view-mode]"));
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
    els.emptyStateTitle = document.querySelector("#emptyState strong");
    els.emptyStateText = document.querySelector("#emptyState p");
    els.catalogError = document.querySelector("#catalogError");
    els.retryCatalog = document.querySelector("#retryCatalog");
    els.clearFilters = document.querySelector("#clearFilters");
    els.availableProducts = document.querySelector("#availableProducts");
    els.stockHealth = document.querySelector("#stockHealth");
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
    els.cartButton = document.querySelector("#cartButton");
    els.cartBadges = Array.from(document.querySelectorAll(".cart-badge"));
    els.cartDialog = document.querySelector("#cartDialog");
    els.cartClose = document.querySelector("#cartClose");
    els.cartItems = document.querySelector("#cartItems");
    els.cartEmpty = document.querySelector("#cartEmpty");
    els.cartSummary = document.querySelector("#cartSummary");
    els.checkoutForm = document.querySelector("#checkoutForm");
    els.checkoutNameInput = document.querySelector("#checkoutNameInput");
    els.checkoutWhatsappInput = document.querySelector("#checkoutWhatsappInput");
    els.checkoutNotesInput = document.querySelector("#checkoutNotesInput");
    els.checkoutButton = document.querySelector("#checkoutButton");
    els.checkoutResult = document.querySelector("#checkoutResult");
    els.orderStatusForm = document.querySelector("#orderStatusForm");
    els.orderNumberInput = document.querySelector("#orderNumberInput");
    els.orderWhatsappInput = document.querySelector("#orderWhatsappInput");
    els.orderStatusButton = document.querySelector("#orderStatusButton");
    els.orderStatusResult = document.querySelector("#orderStatusResult");
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
      if (!isOpen) closeNavDropdowns();
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

    document.addEventListener("pointerdown", (event) => {
      closeOpenPanelsFromOutside(event.target);
    });

    window.addEventListener(
      "scroll",
      () => {
        closeOpenPanels();
      },
      { passive: true },
    );

    els.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      resetFiltersForSearch();
      updateSearchMode();
      renderProducts();
      scrollToCatalogOnSearch();
      queueRemoteSearch();
    });

    els.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderProducts();
    });

    els.viewModeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setViewMode(button.dataset.viewMode);
      });
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
    document.addEventListener("click", handleCartClick);
    document.addEventListener("change", handleCartQuantityChange);
    els.cartButton.addEventListener("click", () => openCartDialog());
    els.cartClose.addEventListener("click", () => closeCartDialog());
    els.cartDialog.addEventListener("click", (event) => {
      if (event.target === els.cartDialog) closeCartDialog();
    });
    els.checkoutForm.addEventListener("submit", handleCheckoutSubmit);
    els.orderStatusForm.addEventListener("submit", handleOrderStatusSubmit);

    els.dialogClose.addEventListener("click", () => closeProductDialog());
    els.productDialog.addEventListener("click", (event) => {
      if (event.target === els.productDialog) closeProductDialog();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.productDialog.open) closeProductDialog();
      if (event.key === "Escape" && els.cartDialog.open) closeCartDialog();
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
      syncCartWithCatalog();
      state.loading = false;
      queueProductTranslations();
    }
  }

  function renderAll() {
    applyTranslations();
    updateSearchMode();
    renderStoreInfo();
    renderCategories();
    renderBrands();
    renderNavigationMenus();
    renderSellers();
    renderHeroShowcase();
    renderFeaturedProducts();
    renderProducts();
    renderCart();
    injectStructuredData();
    queueProductTranslations();
  }

  function renderStoreInfo() {
    const social = store.social || {};
    const socialUsername = social.username || "@smartshopcde";
    const address = store.address || DEFAULT_ADDRESS;
    const hours = getTranslatedHours(store.hours);
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
    window.clearInterval(heroSliderTimer);
    els.heroShowcase.innerHTML = HERO_SLIDES.length
      ? HERO_SLIDES
          .map(
            (image, index) => `
              <figure class="hero-product-slide${index === 0 ? " is-active" : ""}">
                <img src="${escapeHtml(image)}" alt="" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
              </figure>
            `
          )
          .join("")
      : `<img class="hero-logo-fallback" src="assets/logo-smartshop.png" width="160" height="160" alt="">`;

    if (HERO_SLIDES.length > 1) {
      heroSliderTimer = window.setInterval(showNextHeroProduct, 2000);
    }
  }

  function showNextHeroProduct() {
    const slides = Array.from(els.heroShowcase.querySelectorAll(".hero-product-slide"));
    if (slides.length <= 1) return;
    const currentIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    const nextIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.remove("is-active");
    slides[nextIndex].classList.add("is-active");
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
        renderStoreInfo();
        renderNavigationMenus();
        renderSellers();
        renderFeaturedProducts();
        renderProducts();
        injectStructuredData();
        if (state.dialogProductId) {
          const product = products.find((item) => item.id === state.dialogProductId);
          if (product && els.productDialog.open) openProductDialog(product);
        }
      })
      .catch((error) => {
        console.warn("No se pudo traducir el catalogo con Cloudflare Workers AI.", error);
      })
      .finally(() => {
        productTranslationPromise = null;
      });
  }

  function collectTranslatableProductTexts() {
    const texts = new Set();
    addTranslatableText(texts, store.hours);
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

  function getTranslatedHours(value) {
    const defaultHours = TRANSLATIONS.es["location.defaultHours"];
    const hours = String(value || defaultHours).trim();
    if (normalizeText(hours) === normalizeText(defaultHours)) {
      return t("location.defaultHours");
    }
    return getTranslatedText(hours);
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
      els.resultCount.textContent = t("status.notAvailable");
      els.availableProducts.textContent = t("status.catalogUnavailable");
      els.stockHealth.textContent = t("status.retryLoad");
      return;
    }

    const filteredProducts = getVisibleProducts();
    const availableCount = products.filter((product) => getStock(product) > 0).length;
    const soldOutCount = products.length - availableCount;

    els.productGrid.setAttribute("aria-busy", "false");
    els.productGrid.classList.toggle("is-list-view", state.viewMode === "list");
    els.productGrid.innerHTML = filteredProducts.map((product) => renderProductCard(product)).join("");
    els.catalogError.hidden = true;
    els.emptyState.hidden = filteredProducts.length > 0;
    renderEmptyStateCopy();
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
  }

  function setViewMode(viewMode) {
    state.viewMode = viewMode === "list" ? "list" : "cards";
    els.viewModeButtons.forEach((button) => {
      const isActive = button.dataset.viewMode === state.viewMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts();
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
    const cartVariant = getDefaultCartVariant(product);

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
            <button class="ghost-button cart-add-button" type="button" data-add-to-cart data-product-id="${escapeHtml(product.id)}" data-variant-id="${escapeHtml(cartVariant?.id || "")}" ${cartVariant ? "" : "disabled"}>${t("product.addCart")}</button>
            <a class="product-action" href="${whatsappUrl}" target="_blank" rel="noopener">${actionText}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderEmptyStateCopy() {
    const titleKey = state.search ? "catalog.searchEmptyTitle" : "catalog.emptyTitle";
    const textKey = state.search ? "catalog.searchEmptyText" : "catalog.emptyText";
    els.emptyStateTitle.textContent = t(titleKey);
    els.emptyStateText.textContent = t(textKey);
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
              ${seller.schedule ? `<p>${escapeHtml(getTranslatedHours(seller.schedule))}</p>` : ""}
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
    const variantsHtml = renderProductVariants(product);
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
          ${variantsHtml}
          ${
            variantsHtml
              ? ""
              : `<ul class="product-specs is-large">${details.map((detail) => `<li>${escapeHtml(getTranslatedText(detail))}</li>`).join("")}</ul>`
          }
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

  function renderProductVariants(product) {
    const variants = Array.isArray(product.variants)
      ? product.variants.filter((variant) => variant.active !== false)
      : [];
    if (variants.length <= 1) return "";
    return `
      <section class="variant-list" aria-label="${escapeHtml(t("product.availableVariants"))}">
        <h3>${escapeHtml(t("product.availableVariants"))}</h3>
        ${variants
          .map((variant) => {
            const label = getVariantDisplayName(variant);
            const stockStatus = getStockStatus(Number(variant.stock || 0));
            return `
              <div class="variant-option">
                <img src="${escapeHtml(variant.image || product.image)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async">
                <div>
                  <strong>${escapeHtml(label)}</strong>
                  <small>${escapeHtml(t("product.code"))}: ${escapeHtml(variant.sku || "")}</small>
                </div>
                <div>
                  ${renderPriceBlock(variant.price)}
                  <span class="stock-pill ${stockStatus.className}">${stockStatus.label}</span>
                </div>
                <button class="ghost-button cart-add-button" type="button" data-add-to-cart data-product-id="${escapeHtml(product.id)}" data-variant-id="${escapeHtml(variant.id || "")}" ${Number(variant.stock || 0) > 0 ? "" : "disabled"}>${t("cart.add")}</button>
              </div>
            `;
          })
          .join("")}
      </section>
    `;
  }

  function closeProductDialog() {
    state.dialogProductId = "";
    if (typeof els.productDialog.close === "function") {
      els.productDialog.close();
    } else {
      els.productDialog.removeAttribute("open");
    }
  }

  function handleCartClick(event) {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      event.preventDefault();
      addToCart(addButton.dataset.productId, addButton.dataset.variantId);
      return;
    }

    const actionButton = event.target.closest("[data-cart-action]");
    if (actionButton) {
      event.preventDefault();
      updateCartItem(actionButton.dataset.variantId, actionButton.dataset.cartAction);
      return;
    }

    if (event.target.closest("[data-cart-close]")) {
      closeCartDialog();
    }
  }

  function handleCartQuantityChange(event) {
    const input = event.target.closest("[data-cart-quantity]");
    if (!input) return;
    const quantity = Math.max(1, Math.min(Number(input.max || 99), Number(input.value || 1)));
    setCartQuantity(input.dataset.variantId, quantity);
  }

  function addToCart(productId, variantId) {
    const line = buildCartLine(productId, variantId);
    if (!line || line.stock <= 0) {
      showToast(t("status.soldOut"), "error");
      return;
    }

    const current = state.cart.find((item) => item.variantId === line.variantId);
    if (current) {
      if (current.quantity >= line.stock) {
        showToast(t("cart.stockLimit"), "error");
        return;
      }
      current.quantity += 1;
      Object.assign(current, line, { quantity: current.quantity });
    } else {
      state.cart.push({ ...line, quantity: 1 });
    }

    saveCart();
    renderCart();
    els.checkoutResult.hidden = true;
    showToast(t("cart.added"));
  }

  function updateCartItem(variantId, action) {
    const current = state.cart.find((item) => item.variantId === variantId);
    if (!current) return;
    if (action === "remove") {
      state.cart = state.cart.filter((item) => item.variantId !== variantId);
    }
    if (action === "decrease") {
      current.quantity -= 1;
      if (current.quantity <= 0) state.cart = state.cart.filter((item) => item.variantId !== variantId);
    }
    if (action === "increase") {
      if (current.quantity >= current.stock) {
        showToast(t("cart.stockLimit"), "error");
        return;
      }
      current.quantity += 1;
    }
    saveCart();
    renderCart();
  }

  function setCartQuantity(variantId, quantity) {
    const current = state.cart.find((item) => item.variantId === variantId);
    if (!current) return;
    current.quantity = Math.max(1, Math.min(current.stock, quantity));
    saveCart();
    renderCart();
  }

  function openCartDialog() {
    renderCart();
    if (typeof els.cartDialog.showModal === "function") {
      els.cartDialog.showModal();
    } else {
      els.cartDialog.setAttribute("open", "");
    }
  }

  function closeCartDialog() {
    if (typeof els.cartDialog.close === "function") {
      els.cartDialog.close();
    } else {
      els.cartDialog.removeAttribute("open");
    }
  }

  function renderCart() {
    if (!els.cartItems) return;
    const items = state.cart;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = getCartSubtotal();

    els.cartBadges.forEach((badge) => {
      badge.textContent = String(totalItems);
      badge.setAttribute("aria-label", `${totalItems} ${t("nav.cartAria")}`);
    });

    els.cartEmpty.hidden = items.length > 0;
    els.checkoutForm.hidden = items.length === 0;
    els.cartSummary.hidden = items.length === 0;
    els.cartItems.innerHTML = items.map(renderCartItem).join("");
    els.cartSummary.innerHTML = items.length
      ? `
        <span>${t("cart.subtotal")}</span>
        <strong>${formatUsdPrice(subtotal)}</strong>
        <small>${formatGuaraniPrice(convertUsdToPyg(subtotal))} · ${formatRealPrice(convertUsdToBrl(subtotal))}</small>
      `
      : "";
  }

  function renderCartItem(item) {
    return `
      <article class="cart-item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.productName)}" loading="lazy" decoding="async">
        <div class="cart-item-info">
          <strong>${escapeHtml(item.productName)}</strong>
          ${item.variantName ? `<small>${escapeHtml(item.variantName)}</small>` : ""}
          <small>${t("product.code")}: ${escapeHtml(item.code)}</small>
          <span>${formatUsdPrice(item.price)}</span>
        </div>
        <div class="cart-quantity" aria-label="${escapeHtml(t("cart.quantity"))}">
          <button type="button" data-cart-action="decrease" data-variant-id="${escapeHtml(item.variantId)}">-</button>
          <input type="number" min="1" max="${Number(item.stock || 1)}" value="${Number(item.quantity || 1)}" data-cart-quantity data-variant-id="${escapeHtml(item.variantId)}" aria-label="${escapeHtml(t("cart.quantity"))}">
          <button type="button" data-cart-action="increase" data-variant-id="${escapeHtml(item.variantId)}">+</button>
        </div>
        <button class="ghost-button cart-remove" type="button" data-cart-action="remove" data-variant-id="${escapeHtml(item.variantId)}">${t("cart.remove")}</button>
      </article>
    `;
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault();
    if (!state.cart.length) return;
    setButtonLoading(els.checkoutButton, true, t("cart.sending"));
    els.checkoutResult.hidden = true;

    try {
      const order = await window.SmartShopSupabase.createOrder({
        customer: {
          name: els.checkoutNameInput.value.trim(),
          whatsapp: els.checkoutWhatsappInput.value.trim(),
        },
        notes: els.checkoutNotesInput.value.trim(),
        items: state.cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });
      state.cart = [];
      saveCart();
      renderCart();
      els.orderNumberInput.value = order.orderNumber || "";
      els.orderWhatsappInput.value = els.checkoutWhatsappInput.value.trim();
      els.checkoutForm.reset();
      renderCheckoutSuccess(order);
    } catch (error) {
      renderCheckoutError(error.message || t("cart.error"));
    } finally {
      setButtonLoading(els.checkoutButton, false);
    }
  }

  async function handleOrderStatusSubmit(event) {
    event.preventDefault();
    setButtonLoading(els.orderStatusButton, true);
    els.orderStatusResult.hidden = true;
    try {
      const order = await window.SmartShopSupabase.getOrderStatus({
        orderNumber: els.orderNumberInput.value.trim(),
        whatsapp: els.orderWhatsappInput.value.trim(),
      });
      renderOrderStatus(order);
    } catch (error) {
      els.orderStatusResult.hidden = false;
      els.orderStatusResult.className = "order-status-result is-error";
      els.orderStatusResult.innerHTML = `<strong>${escapeHtml(error.message || t("orders.notFound"))}</strong>`;
    } finally {
      setButtonLoading(els.orderStatusButton, false);
    }
  }

  function renderCheckoutSuccess(order) {
    els.checkoutResult.hidden = false;
    els.checkoutResult.className = "checkout-result is-success";
    els.checkoutResult.innerHTML = `
      <strong>${t("cart.successTitle")}: ${escapeHtml(order.orderNumber || "")}</strong>
      <p>${t("cart.successCopy")}</p>
      <a class="ghost-button" href="#pedidos" data-cart-close>${t("orders.checkStatus")}</a>
    `;
  }

  function renderCheckoutError(message) {
    els.checkoutResult.hidden = false;
    els.checkoutResult.className = "checkout-result is-error";
    els.checkoutResult.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
  }

  function renderOrderStatus(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    els.orderStatusResult.hidden = false;
    els.orderStatusResult.className = "order-status-result";
    els.orderStatusResult.innerHTML = `
      <div class="order-status-card">
        <div>
          <span class="status-pill ${getOrderStatusClass(order.status)}">${escapeHtml(getOrderStatusLabel(order.status))}</span>
          <h3>${escapeHtml(order.orderNumber || "")}</h3>
          <p>${t("orders.createdAt")}: ${formatDate(order.createdAt)}</p>
        </div>
        <div class="order-status-total">
          <span>${t("orders.total")}</span>
          <strong>${formatUsdPrice(order.totalUsd)}</strong>
        </div>
      </div>
      <div class="order-status-items">
        <strong>${t("orders.items")}</strong>
        ${items.map((item) => `
          <span>${Number(item.quantity || 0)}x ${escapeHtml(item.productName || "")}${item.variantName ? ` · ${escapeHtml(item.variantName)}` : ""}</span>
        `).join("")}
      </div>
    `;
  }

  function buildCartLine(productId, variantId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return null;
    const variant = getCartVariant(product, variantId);
    if (!variant?.id) return null;
    const variantName = getVariantDisplayName(variant);
    return {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variantName === "Default" ? "" : variantName,
      code: variant.sku || getProductCode(product),
      price: Number(variant.price ?? product.price ?? 0),
      stock: Number(variant.stock || 0),
      image: variant.image || product.image,
    };
  }

  function getDefaultCartVariant(product) {
    const variants = getActiveVariants(product);
    return variants.find((variant) => Number(variant.stock || 0) > 0) || variants[0] || null;
  }

  function getCartVariant(product, variantId) {
    const variants = getActiveVariants(product);
    return variants.find((variant) => variant.id === variantId) || getDefaultCartVariant(product);
  }

  function getActiveVariants(product) {
    return Array.isArray(product.variants) ? product.variants.filter((variant) => variant.active !== false) : [];
  }

  function syncCartWithCatalog() {
    if (!state.cart.length || !products.length) return;
    state.cart = state.cart
      .map((item) => {
        const line = buildCartLine(item.productId, item.variantId);
        if (!line || line.stock <= 0) return null;
        return {
          ...line,
          quantity: Math.max(1, Math.min(Number(item.quantity || 1), line.stock)),
        };
      })
      .filter(Boolean);
    saveCart();
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item?.variantId && item?.productId) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
    } catch {
      // El carrito sigue disponible en memoria si el navegador bloquea localStorage.
    }
  }

  function getCartSubtotal() {
    return roundMoney(state.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0));
  }

  function setButtonLoading(button, isLoading, label = "") {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = label || button.textContent;
      button.disabled = true;
      return;
    }
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `site-toast is-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.classList.add("is-visible"), 10);
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 180);
    }, 2200);
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
    state.searchScrolled = false;
    els.searchInput.value = "";
    updateSearchMode();
    els.onlyAvailable.checked = false;
    els.minPriceInput.value = "";
    els.maxPriceInput.value = "";
    renderCategories();
    renderBrands();
    renderProducts();
  }

  function resetFiltersForSearch() {
    if (!state.search) {
      state.searchScrolled = false;
      return;
    }

    const hadFilters =
      state.category !== "Todos" ||
      state.brand !== "Todas" ||
      state.onlyAvailable ||
      state.minPrice ||
      state.maxPrice;

    state.category = "Todos";
    state.brand = "Todas";
    state.onlyAvailable = false;
    state.minPrice = "";
    state.maxPrice = "";
    els.onlyAvailable.checked = false;
    els.minPriceInput.value = "";
    els.maxPriceInput.value = "";

    if (hadFilters) {
      renderCategories();
      renderBrands();
    }
  }

  function updateSearchMode() {
    document.body.classList.toggle("is-searching", Boolean(state.search.trim()));
  }

  function scrollToCatalogOnSearch() {
    if (state.search.length < 2 || state.searchScrolled) return;
    state.searchScrolled = true;
    const catalog = document.querySelector("#catalogo");
    if (!catalog || isElementInViewport(catalog)) return;
    catalog.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;
  }

  function queueRemoteSearch() {
    window.clearTimeout(searchTimer);
    const query = state.search.trim();
    if (!window.SmartShopSupabase?.isConfigured() || query.length < 2) {
      searchRequestId += 1;
      return;
    }

    const requestId = searchRequestId + 1;
    searchRequestId = requestId;
    searchTimer = window.setTimeout(() => {
      loadRemoteSearch(query, requestId);
    }, 240);
  }

  async function loadRemoteSearch(query, requestId) {
    try {
      const remoteProducts = await window.SmartShopSupabase.searchPublicProducts(query);
      if (requestId !== searchRequestId || state.search.trim() !== query) return;
      if (mergeProducts(remoteProducts)) {
        renderCategories();
        renderBrands();
        renderNavigationMenus();
        renderFeaturedProducts();
        renderProducts();
        queueProductTranslations();
      }
    } catch (error) {
      console.warn("No pudimos completar la busqueda remota.", error);
    }
  }

  function mergeProducts(nextProducts) {
    if (!Array.isArray(nextProducts) || !nextProducts.length) return false;
    const byId = new Map(products.map((product) => [product.id, product]));
    let changed = false;

    nextProducts.forEach((product) => {
      const current = byId.get(product.id);
      if (!current || JSON.stringify(current) !== JSON.stringify(product)) {
        byId.set(product.id, product);
        changed = true;
      }
    });

    if (!changed) return false;
    products = Array.from(byId.values());
    data.products = products;
    return true;
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
        const details = getProductDetails(product);
        const variantSearchFields = Array.isArray(product.variants)
          ? product.variants.flatMap((variant) => [
              variant.name,
              variant.label,
              variant.color,
              variant.storage,
              variant.sku,
            ])
          : [];
        const haystack = normalizeText(
          [
            product.name,
            product.slug,
            product.category,
            product.categorySlug,
            getCategoryLabel(product.category),
            product.code,
            product.public_code,
            product.publicCode,
            product.sku,
            product.brand,
            product.variant,
            product.description,
            getTranslatedText(product.description),
            ...details,
            ...details.map(getTranslatedText),
            ...variantSearchFields,
          ].join(" ")
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

  function getVariantDisplayName(variant) {
    return variant.label || [variant.storage, variant.color].filter(Boolean).join(" / ") || variant.name || t("product.variant");
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
            code: product.code || product.public_code || product.publicCode || "",
            sku: product.sku || "",
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

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(state.language === "pt" ? "pt-BR" : "es-PY", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function getOrderStatusLabel(status) {
    return t(`orderStatus.${status || "new"}`);
  }

  function getOrderStatusClass(status) {
    if (status === "cancelled") return "is-sold-out";
    if (status === "delivered" || status === "ready") return "is-available";
    if (status === "preparing" || status === "confirmed") return "is-low-stock";
    return "is-active";
  }

  function roundMoney(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
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
    closeNavDropdowns();
  }

  function closeFilters() {
    els.catalogFilters.classList.remove("is-open");
    els.filterToggle.setAttribute("aria-expanded", "false");
  }

  function closeNavDropdowns() {
    document.querySelectorAll(".nav-menu.is-open").forEach((menu) => {
      menu.classList.remove("is-open");
      const trigger = menu.querySelector(".nav-menu > a");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function closeOpenPanels() {
    if (els.siteNav.classList.contains("is-open")) closeMobileMenu();
    if (els.catalogFilters.classList.contains("is-open")) closeFilters();
  }

  function closeOpenPanelsFromOutside(target) {
    if (
      els.siteNav.classList.contains("is-open") &&
      !els.siteNav.contains(target) &&
      !els.mobileMenuToggle.contains(target)
    ) {
      closeMobileMenu();
    }

    if (
      els.catalogFilters.classList.contains("is-open") &&
      !els.catalogFilters.contains(target) &&
      !els.filterToggle.contains(target)
    ) {
      closeFilters();
    }
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
      "layout-grid": '<rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect>',
      list: '<path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path>',
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
