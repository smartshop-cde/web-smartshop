# SmartShop en Cloudflare Pages + Supabase

Esta etapa deja el catalogo publico y el panel `/admin` funcionando como sitio estatico en Cloudflare Pages, con datos dinamicos en Supabase.

## Arquitectura activa

```text
GitHub
  -> Cloudflare Pages
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

Cloudflare Pages debe tener estas variables:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

La clave anon es publica y trabaja con RLS. La seguridad real esta en las politicas de Supabase.

## Cloudflare Pages

Configuracion recomendada:

```text
Framework preset: None
Build command: pnpm run build
Build output directory: dist
Root directory: /
```

El build copia `public/` a `dist/` y genera `dist/assets/supabase-env.js` con las variables publicas de Supabase.

## Migrar datos actuales

Para generar un SQL desde `public/assets/store-data.js`:

```bash
pnpm run supabase:export-seed
```

Esto crea:

```text
supabase/generated/import-store-data.sql
```

Revisa el archivo y ejecútalo en Supabase SQL Editor despues de la migracion principal.

## RLS

Todas las tablas relevantes tienen Row Level Security activo.

Publico:

- puede leer categorias activas;
- puede leer productos activos;
- puede leer variantes activas de productos activos;
- puede leer imagenes de productos activos;
- puede leer vendedores activos.

Admin:

- debe iniciar sesion con Supabase Auth;
- debe tener `profiles.role = 'admin'`;
- puede crear, editar, ocultar y eliminar productos, categorias, variantes, imagenes y vendedores.

## Storage

Buckets:

- `product-images`
- `seller-images`

Limites:

- maximo 5 MB;
- formatos permitidos: JPG, PNG, WebP, GIF.

## Dominio

En Cloudflare, configura `smartshop.com.py` como dominio del proyecto Pages. Para redirigir `www.smartshop.com.py` al dominio principal, crea una Redirect Rule:

```text
if hostname equals www.smartshop.com.py
then Static redirect to https://smartshop.com.py/${uri.path}
Status code: 301
Preserve query string: yes
```
