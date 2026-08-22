# SmartShop Web

SmartShop esta evolucionando desde catalogo estatico con SQLite hacia una arquitectura preparada para e-commerce.

La plataforma activa para el catalogo publicado queda preparada asi:

```text
Cloudflare Workers Static Assets
        ↓
HTML/CSS/JS
        ↓
Supabase Auth + PostgreSQL + Storage
```

La arquitectura Node/Express + Prisma se conserva para una etapa futura de carrito, pedidos, pagos y facturacion:

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
- Proyecto Supabase para el despliegue estatico en Cloudflare Workers.

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
- `SUPABASE_URL`: URL publica del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave anon/public de Supabase. No usar `service_role` en frontend.

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

## Supabase

Ejecuta la migracion reproducible:

```text
supabase/migrations/20260821160000_smartshop_catalog.sql
```

Crea el primer usuario administrador desde Supabase Auth y asigna rol:

```sql
insert into public.profiles (id, role)
values ('UUID_DEL_USUARIO', 'admin')
on conflict (id) do update
set role = 'admin';
```

Generar SQL para importar los datos actuales de `public/assets/store-data.js`:

```bash
npm run supabase:export-seed
```

El archivo generado queda en `supabase/generated/import-store-data.sql` y no se sube a Git.

## Cloudflare Workers Static Assets

Configuracion recomendada:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Version command: npx wrangler versions upload
Root directory: /
Environment variables:
  SUPABASE_URL
  SUPABASE_ANON_KEY
```

`wrangler.jsonc` publica el Worker `smartshop` con `assets.directory = "./dist"`. No hay Worker dinamico en esta etapa.

El script de build copia `public/` a `dist/`, crea `dist/admin/index.html` para que `/admin` funcione como ruta estatica y genera `assets/supabase-env.js` con las variables publicas de Supabase.

No configurar `SUPABASE_SERVICE_ROLE_KEY` en Cloudflare ni en el frontend.

Guia detallada: `docs/supabase-cloudflare.md`.

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

- `sku`, sincronizado automaticamente con `Product.publicCode`
- `price`
- `stock`

El stock esta en variante y tiene restriccion `stock >= 0`.

## Excel

El panel administrador permite importar productos desde Excel y descargar una plantilla desde:

```text
/admin -> Productos -> Descargar formato
```

Columnas de la plantilla:

- `nombre`
- `marca`
- `categoria`
- `variante`
- `precio`
- `stock`
- `descripcion`
- `destacado`
- `activo`

El importador muestra una vista previa antes de guardar:

- nuevos productos;
- actualizaciones;
- categorias nuevas;
- errores por fila.

No se carga `sku` en Excel. El codigo publico de 5 digitos lo genera Supabase y la variante usa ese mismo valor como SKU.

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
