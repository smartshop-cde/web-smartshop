create extension if not exists pgcrypto;

create or replace function public.smartshop_slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    translate(lower(coalesce(input, '')), 'áàäâãéèëêíìïîóòöôõúùüûñç', 'aaaaaeeeeiiiiooooouuuunc'),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  public_code varchar(5) not null unique,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique,
  description text not null default '',
  brand text not null default '',
  category_id uuid not null references public.categories(id),
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_public_code_format check (public_code ~ '^[0-9]{5}$')
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null default 'Default',
  sku text unique,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null check (url ~ '^https?://'),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  whatsapp text not null default '' check (whatsapp ~ '^[0-9+ ()-]*$'),
  role text not null default '',
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_sort_idx on public.categories(active, sort_order);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_featured_idx on public.products(active, featured, sort_order);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists product_variants_product_active_idx on public.product_variants(product_id, active, sort_order);
create index if not exists product_variants_stock_idx on public.product_variants(stock);
create index if not exists product_images_product_sort_idx on public.product_images(product_id, is_primary desc, sort_order);
create unique index if not exists product_images_one_primary_idx on public.product_images(product_id) where is_primary;
create index if not exists sellers_active_sort_idx on public.sellers(active, sort_order);

create or replace function public.generate_product_public_code()
returns varchar(5)
language plpgsql
as $$
declare
  candidate varchar(5);
  attempt integer := 0;
begin
  loop
    candidate := floor(10000 + random() * 90000)::integer::text;
    exit when not exists (select 1 from public.products where public_code = candidate);
    attempt := attempt + 1;
    if attempt >= 100 then
      raise exception 'No se pudo generar un codigo publico unico';
    end if;
  end loop;

  return candidate;
end;
$$;

create or replace function public.set_product_public_code()
returns trigger
language plpgsql
as $$
begin
  if new.public_code is null or new.public_code !~ '^[0-9]{5}$' then
    new.public_code := public.generate_product_public_code();
  end if;

  return new;
end;
$$;

create or replace function public.ensure_category_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 2;
begin
  base_slug := public.smartshop_slugify(coalesce(nullif(new.slug, ''), new.name));
  if base_slug = '' then
    base_slug := 'categoria';
  end if;

  candidate := base_slug;
  while exists (select 1 from public.categories where slug = candidate and id <> new.id) loop
    candidate := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

create or replace function public.ensure_product_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 2;
begin
  base_slug := public.smartshop_slugify(coalesce(nullif(new.slug, ''), new.name));
  if base_slug = '' then
    base_slug := 'producto';
  end if;

  candidate := base_slug;
  while exists (select 1 from public.products where slug = candidate and id <> new.id) loop
    candidate := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists sellers_set_updated_at on public.sellers;
create trigger sellers_set_updated_at
before update on public.sellers
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists categories_ensure_slug on public.categories;
create trigger categories_ensure_slug
before insert or update of name, slug on public.categories
for each row execute function public.ensure_category_slug();

drop trigger if exists products_ensure_slug on public.products;
create trigger products_ensure_slug
before insert or update of name, slug on public.products
for each row execute function public.ensure_product_slug();

drop trigger if exists products_set_public_code on public.products;
create trigger products_set_public_code
before insert on public.products
for each row execute function public.set_product_public_code();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.sellers enable row level security;

create policy "Users read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Admins manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public reads active categories"
on public.categories for select
to anon, authenticated
using (active = true or public.is_admin());

create policy "Admins manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public reads active products"
on public.products for select
to anon, authenticated
using (active = true or public.is_admin());

create policy "Admins manage products"
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public reads active variants from active products"
on public.product_variants for select
to anon, authenticated
using (
  public.is_admin()
  or (
    active = true
    and exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.active = true
    )
  )
);

create policy "Admins manage variants"
on public.product_variants for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public reads images from active products"
on public.product_images for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.active = true
  )
);

create policy "Admins manage product images"
on public.product_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public reads active sellers"
on public.sellers for select
to anon, authenticated
using (active = true or public.is_admin());

create policy "Admins manage sellers"
on public.sellers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.sellers to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant insert, update, delete on public.sellers to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('seller-images', 'seller-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads SmartShop images"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('product-images', 'seller-images'));

create policy "Admins upload SmartShop images"
on storage.objects for insert
to authenticated
with check (bucket_id in ('product-images', 'seller-images') and public.is_admin());

create policy "Admins update SmartShop images"
on storage.objects for update
to authenticated
using (bucket_id in ('product-images', 'seller-images') and public.is_admin())
with check (bucket_id in ('product-images', 'seller-images') and public.is_admin());

create policy "Admins delete SmartShop images"
on storage.objects for delete
to authenticated
using (bucket_id in ('product-images', 'seller-images') and public.is_admin());
