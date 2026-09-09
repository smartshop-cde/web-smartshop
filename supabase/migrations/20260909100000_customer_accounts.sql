alter table public.profiles
add column if not exists full_name text not null default '';

alter table public.profiles
add column if not exists whatsapp text not null default '';

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, whatsapp)
  values (
    new.id,
    'viewer',
    left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120),
    left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'whatsapp', ''), '\D', '', 'g'), 20)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into public.profiles (id, role, full_name, whatsapp)
select
  id,
  'viewer',
  left(trim(coalesce(raw_user_meta_data ->> 'full_name', '')), 120),
  left(regexp_replace(coalesce(raw_user_meta_data ->> 'whatsapp', ''), '\D', '', 'g'), 20)
from auth.users
on conflict (id) do update
set
  full_name = case
    when public.profiles.full_name = '' then excluded.full_name
    else public.profiles.full_name
  end,
  whatsapp = case
    when public.profiles.whatsapp = '' then excluded.whatsapp
    else public.profiles.whatsapp
  end;

create table if not exists public.customer_cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_variant_id)
);

create table if not exists public.customer_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists customer_cart_items_variant_idx on public.customer_cart_items(product_variant_id);
create index if not exists customer_favorites_product_idx on public.customer_favorites(product_id);

drop trigger if exists customer_cart_items_set_updated_at on public.customer_cart_items;
create trigger customer_cart_items_set_updated_at
before update on public.customer_cart_items
for each row execute function public.set_updated_at();

alter table public.customer_cart_items enable row level security;
alter table public.customer_favorites enable row level security;

drop policy if exists "Customers update own profile" on public.profiles;
create policy "Customers update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'viewer');

drop policy if exists "Customers manage own cart" on public.customer_cart_items;
create policy "Customers manage own cart"
on public.customer_cart_items for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.product_variants variant
    join public.products product on product.id = variant.product_id
    where variant.id = product_variant_id
      and variant.product_id = product_id
      and variant.active = true
      and product.active = true
  )
);

drop policy if exists "Admins read customer cart" on public.customer_cart_items;
create policy "Admins read customer cart"
on public.customer_cart_items for select
to authenticated
using (public.is_admin());

drop policy if exists "Customers manage own favorites" on public.customer_favorites;
create policy "Customers manage own favorites"
on public.customer_favorites for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.products product
    where product.id = product_id
      and product.active = true
  )
);

drop policy if exists "Admins read customer favorites" on public.customer_favorites;
create policy "Admins read customer favorites"
on public.customer_favorites for select
to authenticated
using (public.is_admin());

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.customer_cart_items to authenticated;
grant select, insert, delete on public.customer_favorites to authenticated;
