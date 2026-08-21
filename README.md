# SmartShop Web

SmartShop esta evolucionando desde catalogo estatico con SQLite hacia una arquitectura preparada para e-commerce:

```text
Frontend HTML/CSS/JS
        ↓
API Node.js / Express
        ↓
Servicios / Repositorios
        ↓
Prisma
        ↓
PostgreSQL
```

El frontend actual se conserva en `public/` y mantiene las mejoras visuales: hero, beneficios, categorias, cards, vendedores por WhatsApp, mapa, direccion, horario y codigo publico de producto.

## Requisitos

- Node.js 22.5 o superior.
- PostgreSQL 14 o superior.
- SQLite actual solo para migracion/respaldo.

## Instalacion

```bash
npm install
cp .env.example .env
```

Configura `DATABASE_URL` en `.env`.

Variables principales:

- `DATABASE_URL`: conexion PostgreSQL.
- `PORT`: puerto del servidor Express.
- `NODE_ENV`: `development`, `test` o `production`.
- `ADMIN_PIN`: PIN inicial/fallback del panel.
- `CORS_ORIGIN`: origen permitido, opcional.

## Base de datos PostgreSQL

Generar cliente Prisma:

```bash
npm run db:generate
```

Aplicar migraciones:

```bash
npm run db:migrate
```

Cargar datos base desde `data/seed.json`:

```bash
npm run db:seed
```

Abrir Prisma Studio:

```bash
npm run db:studio
```

## Migracion desde SQLite

Antes de migrar:

```bash
npm run backup:sqlite
```

Migrar datos actuales:

```bash
npm run migrate:sqlite
```

El script:

- Lee `data/smartshop.sqlite3`.
- Crea `backups/smartshop-before-postgres.sqlite`.
- Conserva productos, categorias, stock, codigos publicos, vendedores y configuracion.
- Crea una variante `Default` por cada producto actual.
- No elimina SQLite.

Para restaurar SQLite, deten el servidor y copia:

```text
backups/smartshop-before-postgres.sqlite
```

a:

```text
data/smartshop.sqlite3
```

## Desarrollo

```bash
npm run dev
```

Servidor:

```text
http://127.0.0.1:8000
```

Health check:

```text
GET /api/health
```

## Produccion

```bash
npm run db:migrate
npm run start
```

Configura en el hosting:

- `DATABASE_URL`
- `PORT`
- `NODE_ENV=production`
- `ADMIN_PIN`
- `CORS_ORIGIN` si aplica

## API principal

Productos:

```text
GET    /api/products
GET    /api/products/:id
GET    /api/products/code/:publicCode
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

Filtros de listado:

```text
?category=
?search=
?brand=
?minPrice=
?maxPrice=
?inStock=true
?page=
?limit=
```

Categorias:

```text
GET /api/categories
```

Compatibilidad actual:

```text
GET  /api/catalog
PUT  /api/catalog
POST /api/login
GET  /api/products/export-excel
POST /api/products/import-excel
```

## Modelo actual

```text
Category
  ↓
Product
  ↓
ProductVariant
```

`Product.publicCode` es el codigo visible al cliente:

- Exactamente 5 digitos.
- Rango `10000` a `99999`.
- Unico en PostgreSQL.
- No es primary key.
- No cambia al editar el producto.

`ProductVariant` contiene:

- `sku`
- `price`
- `stock`

El stock esta en variante y tiene restriccion `stock >= 0`.

## Excel

El panel administrador mantiene importacion/exportacion Excel.

Columnas:

- `accion`: vacio para agregar/actualizar, `eliminar` para quitar.
- `code`: opcional para productos nuevos.
- `sku`: opcional, operativo de variante.
- `name`, `category`, `price`, `stock`.
- `featured`, `badge`, `brand`, `variant`, `condition`, `warranty`, `delivery`, `description`, `details`.

Las fotos no se cargan desde Excel; se editan en el panel.

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Documentacion tecnica

- `docs/arquitectura-actual.md`
- `docs/esquema-futuro-ecommerce.md`

## Servidor legado

`server.py` queda como respaldo SQLite mientras PostgreSQL se valida. Sirve los archivos desde `public/` y no elimina la base SQLite.
