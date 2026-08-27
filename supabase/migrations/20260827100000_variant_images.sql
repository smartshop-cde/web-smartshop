alter table public.product_variants
add column if not exists image_url text;

create index if not exists product_variants_image_url_idx
on public.product_variants(image_url)
where image_url is not null;
