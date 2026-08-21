export function slugify(value, fallback = "item") {
  const slug = String(value || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return slug || fallback;
}

export function uniqueSlug(base, usedSlugs = new Set()) {
  const root = slugify(base);
  let slug = root;
  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${root}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(slug);
  return slug;
}
