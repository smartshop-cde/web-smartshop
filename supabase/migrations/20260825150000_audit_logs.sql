create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_table_record_idx on public.audit_logs(table_name, record_id);

create or replace function public.current_actor_email()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(
      auth.jwt() ->> 'email',
      auth.jwt() #>> '{user_metadata,email}',
      auth.jwt() #>> '{app_metadata,email}'
    ),
    ''
  );
$$;

create or replace function public.audit_table_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_row jsonb;
  new_row jsonb;
  changed_by uuid;
  changed_by_email text;
  target_record_id text;
begin
  if tg_op = 'INSERT' then
    new_row := to_jsonb(new);
    target_record_id := coalesce(new_row ->> 'id', new_row ->> 'key');
  elsif tg_op = 'UPDATE' then
    old_row := to_jsonb(old);
    new_row := to_jsonb(new);
    target_record_id := coalesce(new_row ->> 'id', old_row ->> 'id', new_row ->> 'key', old_row ->> 'key');
  elsif tg_op = 'DELETE' then
    old_row := to_jsonb(old);
    target_record_id := coalesce(old_row ->> 'id', old_row ->> 'key');
  end if;

  changed_by := auth.uid();
  changed_by_email := public.current_actor_email();

  insert into public.audit_logs (
    actor_id,
    actor_email,
    table_name,
    record_id,
    action,
    old_data,
    new_data
  )
  values (
    changed_by,
    changed_by_email,
    tg_table_name,
    target_record_id,
    tg_op,
    old_row,
    new_row
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists audit_profiles_changes on public.profiles;
create trigger audit_profiles_changes
after insert or update or delete on public.profiles
for each row execute function public.audit_table_change();

drop trigger if exists audit_categories_changes on public.categories;
create trigger audit_categories_changes
after insert or update or delete on public.categories
for each row execute function public.audit_table_change();

drop trigger if exists audit_products_changes on public.products;
create trigger audit_products_changes
after insert or update or delete on public.products
for each row execute function public.audit_table_change();

drop trigger if exists audit_product_variants_changes on public.product_variants;
create trigger audit_product_variants_changes
after insert or update or delete on public.product_variants
for each row execute function public.audit_table_change();

drop trigger if exists audit_product_images_changes on public.product_images;
create trigger audit_product_images_changes
after insert or update or delete on public.product_images
for each row execute function public.audit_table_change();

drop trigger if exists audit_sellers_changes on public.sellers;
create trigger audit_sellers_changes
after insert or update or delete on public.sellers
for each row execute function public.audit_table_change();

drop trigger if exists audit_store_settings_changes on public.store_settings;
create trigger audit_store_settings_changes
after insert or update or delete on public.store_settings
for each row execute function public.audit_table_change();

alter table public.audit_logs enable row level security;

create policy "Admins read audit logs"
on public.audit_logs for select
to authenticated
using (public.is_admin());

grant select on public.audit_logs to authenticated;
grant select, insert on public.audit_logs to service_role;
grant execute on function public.current_actor_email() to anon, authenticated;
