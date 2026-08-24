# SmartShop en Cloudflare Workers Static Assets + Supabase

Esta etapa deja el catalogo publico y el panel `/admin` funcionando como sitio estatico en Cloudflare Workers Static Assets, con datos dinamicos en Supabase.

## Arquitectura activa

```text
GitHub
  -> Cloudflare Workers Static Assets
  -> HTML/CSS/JavaScript
  -> Supabase Auth + PostgreSQL + Storage
```

La arquitectura Node/Express + Prisma + PostgreSQL local queda conservada en el repositorio para una etapa futura de carrito, pedidos, pagos y facturacion. No se borra SQLite ni PostgreSQL local.

## Configuracion de Supabase

1. Crea un proyecto en Supabase.
2. En SQL Editor ejecuta `supabase/migrations/20260821160000_smartshop_catalog.sql`.
3. Verifica que existan los buckets `product-images` y `seller-images`.
4. Crea un usuario desde Authentication > Users.
5. Copia el UUID del usuario creado.
6. En SQL Editor asigna rol admin:

```sql
insert into public.profiles (id, role)
values ('UUID_DEL_USUARIO', 'admin')
on conflict (id) do update
set role = 'admin';
```

No guardes claves `service_role` en el repositorio ni en el navegador.

## Variables publicas

Cloudflare debe tener estas variables disponibles durante el build:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

La clave anon es publica y trabaja con RLS. La seguridad real esta en las politicas de Supabase.

## Cloudflare Workers

Configuracion recomendada:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Version command: npx wrangler versions upload
Root directory: /
```

`wrangler.jsonc` usa:

```json
{
  "name": "smartshop",
  "main": "src/worker.js",
  "compatibility_date": "2026-08-22",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },
  "ai": {
    "binding": "AI"
  }
}
```

El Worker solo corre antes para `/api/*`. La ruta `/api/translate` usa Cloudflare Workers AI con el modelo `@cf/meta/m2m100-1.2b`. El resto del sitio sigue funcionando como assets estaticos.

El build copia `public/` a `dist/`, genera `dist/admin/index.html` para la ruta `/admin` y escribe `dist/assets/supabase-env.js` con las variables publicas de Supabase.

## Migrar datos actuales

Para generar un SQL desde `public/assets/store-data.js`:

```bash
npm run supabase:export-seed
```

Esto crea:

```text
supabase/generated/import-store-data.sql
```

Revisa el archivo y ejecutalo en Supabase SQL Editor despues de la migracion principal.

## Importacion Excel desde admin

En `/admin -> Productos` se puede descargar una plantilla y cargar productos por Excel.

La plantilla no pide codigo ni SKU. Supabase genera `products.public_code` automaticamente y `product_variants.sku` queda sincronizado con ese codigo.

El campo `precio` de la plantilla se carga en USD. La web publica muestra USD como precio principal y calcula guaranies/reales con la cotizacion configurada.

Antes de guardar, el panel muestra vista previa con nuevos productos, actualizaciones, categorias nuevas y errores por fila.

## Cotizaciones

Las cotizaciones se administran desde `/admin -> Cotizaciones`.

Supabase guarda estos valores en `public.store_settings`:

```json
{
  "key": "exchange_rates",
  "value": {
    "baseCurrency": "USD",
    "usdToBrl": 5.27,
    "usdToPyg": 6100
  }
}
```

El encabezado publico muestra una referencia compacta, por ejemplo:

```text
🇧🇷 5,27rs 🇵🇾 6100gs
```

## RLS

Todas las tablas relevantes tienen Row Level Security activo.

Publico:

- puede leer categorias activas;
- puede leer productos activos;
- puede leer variantes activas de productos activos;
- puede leer imagenes de productos activos;
- puede leer vendedores activos.
- puede leer `store_settings.exchange_rates`.

Admin:

- debe iniciar sesion con Supabase Auth;
- debe tener `profiles.role = 'admin'`;
- puede crear, editar, ocultar y eliminar productos, categorias, variantes, imagenes, vendedores y cotizaciones.

## Storage

Buckets:

- `product-images`
- `seller-images`

Limites:

- maximo 5 MB;
- formatos permitidos: JPG, PNG, WebP, GIF.

## Dominio

En Cloudflare, configura `smartshop.com.py` como custom domain del Worker `smartshop`. Para redirigir `www.smartshop.com.py` al dominio principal, crea una Redirect Rule:

```text
if hostname equals www.smartshop.com.py
then Static redirect to https://smartshop.com.py/${uri.path}
Status code: 301
Preserve query string: yes
```
