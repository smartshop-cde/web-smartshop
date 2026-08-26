alter table public.product_variants
add column if not exists color text;

alter table public.product_variants
add column if not exists storage text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_variants_sku_format'
      and conrelid = 'public.product_variants'::regclass
  ) then
    alter table public.product_variants
    add constraint product_variants_sku_format
    check (sku is null or sku ~ '^[0-9]{5}$');
  end if;
end;
$$;

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
    exit when not exists (select 1 from public.products where public_code = candidate)
      and not exists (select 1 from public.product_variants where sku = candidate);

    attempt := attempt + 1;
    if attempt >= 100 then
      raise exception 'No se pudo generar un codigo publico unico';
    end if;
  end loop;

  return candidate;
end;
$$;

create or replace function public.generate_variant_public_code(p_product_id uuid)
returns varchar(5)
language plpgsql
as $$
declare
  base_code integer;
  candidate integer;
  candidate_text varchar(5);
  attempt integer := 0;
begin
  select public_code::integer
  into base_code
  from public.products
  where id = p_product_id
    and public_code ~ '^[0-9]{5}$';

  if base_code is not null then
    candidate_text := base_code::text;
    if not exists (select 1 from public.product_variants where sku = candidate_text) then
      return candidate_text;
    end if;
  end if;

  select max(sku::integer) + 1
  into candidate
  from public.product_variants
  where product_id = p_product_id
    and sku ~ '^[0-9]{5}$';

  while candidate between 10000 and 99999 loop
    candidate_text := candidate::text;
    if not exists (select 1 from public.product_variants where sku = candidate_text)
      and not exists (
        select 1
        from public.products
        where public_code = candidate_text
          and id <> p_product_id
      )
    then
      return candidate_text;
    end if;
    candidate := candidate + 1;
  end loop;

  loop
    candidate_text := floor(10000 + random() * 90000)::integer::text;
    exit when not exists (select 1 from public.product_variants where sku = candidate_text)
      and not exists (select 1 from public.products where public_code = candidate_text);

    attempt := attempt + 1;
    if attempt >= 100 then
      raise exception 'No se pudo generar un codigo de variante unico';
    end if;
  end loop;

  return candidate_text;
end;
$$;

create or replace function public.set_variant_public_sku()
returns trigger
language plpgsql
as $$
begin
  if new.sku is null
    or new.sku !~ '^[0-9]{5}$'
    or exists (
      select 1
      from public.product_variants
      where sku = new.sku
        and id <> new.id
    )
  then
    new.sku := public.generate_variant_public_code(new.product_id);
  end if;

  return new;
end;
$$;

drop trigger if exists product_variants_set_public_sku on public.product_variants;
create trigger product_variants_set_public_sku
before insert or update on public.product_variants
for each row execute function public.set_variant_public_sku();
