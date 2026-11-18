const string = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const list = (value, maxItems = 20) => Array.isArray(value) ? value.map((item) => string(item, 180)).filter(Boolean).slice(0, maxItems) : []

const PRODUCT_STATUSES = ['draft', 'active', 'soldOut', 'comingSoon', 'archived']
const STOCK_STATUSES = ['inStock', 'lowStock', 'preOrder', 'madeToOrder', 'soldOut']
const IMAGE_URL_MAX = 500

/**
 * Pure product validation. The route resolves the collection and writes the row.
 * @param {Record<string, any>} input
 */
export function validateProductInput(input) {
  const status = PRODUCT_STATUSES.includes(input.status) ? input.status : 'draft'
  const name = string(input.name, 120)
  const slug = string(input.slug?.current || input.slug, 96).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '')
  const price = Number(input.price)
  const materials = list(input.materials)
  const benefits = list(input.benefits)
  const collectionId = string(input.collection?.id || input.collection?._id || input.collection?._ref, 128)
  const mainImageUrl = string(input.mainImage?.url || input.mainImage?.image?.asset?.url, IMAGE_URL_MAX)
  const mainImageVariants = Array.isArray(input.mainImage?.variants)
    ? input.mainImage.variants
        .filter((variant) => Number.isFinite(Number(variant?.width)) && typeof variant?.url === 'string')
        .map((variant) => ({width: Number(variant.width), url: variant.url}))
    : []

  const errors = []
  if (!name) errors.push('Product name is required.')
  if (!slug) errors.push('Slug is required.')
  if (!Number.isFinite(price) || price < 0) errors.push('Price must be zero or greater.')
  if (status === 'active') {
    if (!string(input.sku, 80)) errors.push('SKU is required for active products.')
    if (!collectionId) errors.push('Category is required for active products.')
    if (!mainImageUrl) errors.push('Main image is required for active products.')
    if (!materials.length && !benefits.length) errors.push('Add at least one material or benefit for active products.')
  }
  if (errors.length) return {errors}

  const product = {
    name,
    slug,
    sku: string(input.sku, 80),
    status,
    featured: Boolean(input.featured),
    displayOrder: Math.max(0, Math.trunc(Number(input.displayOrder) || 0)),
    shortDescription: string(input.shortDescription, 280),
    productStory: string(input.productStory, 1000),
    price,
    currency: 'IDR',
    colors: list(input.colors),
    dimensions: string(input.dimensions, 120),
    weight: string(input.weight, 40),
    materials,
    benefits,
    stockStatus: STOCK_STATUSES.includes(input.stockStatus) ? input.stockStatus : 'inStock',
    madeToOrder: Boolean(input.madeToOrder),
    leadTime: string(input.leadTime, 180),
    whatsAppMessage: string(input.whatsAppMessage, 300),
    collection: collectionId ? {id: collectionId} : null,
    mainImage: mainImageUrl
      ? {
          url: mainImageUrl,
          ...(mainImageVariants.length ? {variants: mainImageVariants} : {}),
          altText: string(input.mainImage?.altText, 160) || name,
          ...(string(input.mainImage?.caption, 180) ? {caption: string(input.mainImage.caption, 180)} : {}),
        }
      : null,
  }
  return {product, collectionId}
}
