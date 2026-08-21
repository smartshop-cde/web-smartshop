# Arquitectura actual de SmartShop

## Resumen

Antes de esta etapa, SmartShop estaba organizado como un sitio estatico con un backend Python opcional:

- `index.html`: home publica del catalogo.
- `admin.html`: panel privado con PIN.
- `assets/app.js`: carga catalogo, filtros, categorias, vendedores, WhatsApp y mapa.
- `assets/admin.js`: edicion de tienda, productos, stock, vendedores, importacion/exportacion Excel.
- `server.py`: servidor HTTP, endpoints API, SQLite, Excel y redireccion `www`.
- `data/seed.json`: datos iniciales.
- `data/smartshop.sqlite3`: base local ignorada por Git.

## Endpoints existentes

- `GET /api/catalog`: devuelve `{ store, products, sellers }`.
- `PUT /api/catalog`: reemplaza catalogo completo. Requiere `X-Admin-Pin`.
- `POST /api/login`: valida PIN del panel.
- `GET /api/products/export-excel`: exporta productos. Requiere `X-Admin-Pin`.
- `POST /api/products/import-excel`: importa productos. Requiere `X-Admin-Pin`.

## Datos y persistencia

SQLite tenia tablas:

- `store_settings`: clave/valor JSON para datos comerciales.
- `products`: producto plano con categoria texto, precio y stock en la misma fila.
- `sellers`: vendedores con WhatsApp, rol, horario, mensaje e imagen.

El stock se guardaba en `products.stock`. Las imagenes se guardaban como URL/ruta en `products.image` y `sellers.image`.

## Creacion y edicion de productos

Los productos se crean o modifican desde:

- Panel admin: `assets/admin.js`.
- API legacy: `PUT /api/catalog`.
- Importacion Excel: `POST /api/products/import-excel`.
- Seed inicial: `data/seed.json`.

El codigo publico de 5 digitos se generaba en backend Python y se conservaba al editar.

## Frontend

La home usaba `fetch('/api/catalog')` y fallback a `assets/store-data.js`.

La logica de filtros, categorias visuales, vendedores por WhatsApp, mapa y mensajes de producto estaba en `assets/app.js`.

## Limitaciones para e-commerce

- Producto, variante, precio y stock estaban mezclados.
- Categoria era texto libre.
- No existian usuarios, carritos, pedidos, pagos ni facturacion.
- SQLite no es ideal para operaciones simultaneas y crecimiento.
- La API no estaba separada en rutas, servicios y repositorios.
