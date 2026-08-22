create table if not exists public.store_settings (
  key text primary key check (length(trim(key)) > 0),
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

alter table public.store_settings enable row level security;

drop policy if exists "Public reads store settings" on public.store_settings;
create policy "Public reads store settings"
on public.store_settings for select
to anon, authenticated
using (key = 'exchange_rates' or public.is_admin());

drop policy if exists "Admins manage store settings" on public.store_settings;
create policy "Admins manage store settings"
on public.store_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.store_settings to anon, authenticated;
grant insert, update, delete on public.store_settings to authenticated;

insert into public.store_settings (key, value)
values ('exchange_rates', '{"baseCurrency":"USD","usdToBrl":5.27,"usdToPyg":6100}'::jsonb)
on conflict (key) do nothing;

update public.product_variants
set price = round(price / 6100, 2)
where price > 10000;
