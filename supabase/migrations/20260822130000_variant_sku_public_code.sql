create or replace function public.set_variant_sku_from_public_code()
returns trigger
language plpgsql
as $$
begin
  select public_code
  into new.sku
  from public.products
  where id = new.product_id;

  return new;
end;
$$;

with first_variants as (
  select distinct on (product_id)
    id,
    product_id
  from public.product_variants
  order by product_id, sort_order, created_at, id
)
update public.product_variants variant
set sku = product.public_code
from first_variants first_variant
join public.products product on product.id = first_variant.product_id
where variant.id = first_variant.id;

drop trigger if exists product_variants_set_public_sku on public.product_variants;
create trigger product_variants_set_public_sku
before insert or update on public.product_variants
for each row execute function public.set_variant_sku_from_public_code();
