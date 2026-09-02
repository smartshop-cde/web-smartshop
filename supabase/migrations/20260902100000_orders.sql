create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null check (length(trim(customer_name)) > 0),
  customer_whatsapp text not null check (customer_whatsapp ~ '^[0-9+ ()-]{8,24}$'),
  customer_email text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  subtotal_usd numeric(12, 2) not null default 0 check (subtotal_usd >= 0),
  total_usd numeric(12, 2) not null default 0 check (total_usd >= 0),
  currency text not null default 'USD',
  notes text not null default '',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null default '',
  public_code text not null default '',
  unit_price_usd numeric(12, 2) not null default 0 check (unit_price_usd >= 0),
  quantity integer not null check (quantity > 0),
  subtotal_usd numeric(12, 2) not null default 0 check (subtotal_usd >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_status_created_at_idx on public.orders(status, created_at desc);
create index if not exists orders_customer_whatsapp_idx on public.orders(customer_whatsapp);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_variant_id_idx on public.order_items(product_variant_id);

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  candidate text;
  attempt integer := 0;
begin
  loop
    candidate := 'SS-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 10000)::integer::text, 4, '0');
    exit when not exists (select 1 from public.orders where order_number = candidate);
    attempt := attempt + 1;
    if attempt >= 100 then
      raise exception 'No se pudo generar un numero de pedido unico';
    end if;
  end loop;

  return candidate;
end;
$$;

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or length(trim(new.order_number)) = 0 then
    new.order_number := public.generate_order_number();
  end if;

  return new;
end;
$$;

drop trigger if exists orders_set_order_number on public.orders;
create trigger orders_set_order_number
before insert on public.orders
for each row execute function public.set_order_number();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders"
on public.orders for select
using (public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items"
on public.order_items for select
using (public.is_admin());

grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select, insert, update on public.orders to service_role;
grant select, insert on public.order_items to service_role;

do $$
begin
  if to_regprocedure('public.audit_table_change()') is not null then
    execute 'drop trigger if exists audit_orders_changes on public.orders';
    execute 'create trigger audit_orders_changes after insert or update or delete on public.orders for each row execute function public.audit_table_change()';

    execute 'drop trigger if exists audit_order_items_changes on public.order_items';
    execute 'create trigger audit_order_items_changes after insert or update or delete on public.order_items for each row execute function public.audit_table_change()';
  end if;
end $$;
