export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productSlug(product) {
  return product.slug || slugify(product.name);
}

export function productCategorySlug(product) {
  return product.collection?.slug || slugify(product.category || "");
}
