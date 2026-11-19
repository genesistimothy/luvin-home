import {createHash, timingSafeEqual} from 'node:crypto'

/**
 * ERP -> website product sync: pure helpers. No I/O here.
 *
 * The ERP owns: name, SKUs, colours (per-SKU variants), prices, availability.
 * The website owns: photos, descriptions, categories, slugs, marketing content.
 * ERP data lives in the product row's `data.erp`; the legacy product fields
 * (name, sku, price, stockStatus, colors) are derived from it so the rest of
 * the site keeps working.
 */

export const MAX_BODY_BYTES = 512_000
export const MAX_PRODUCTS = 200
export const MAX_VARIANTS = 20
export const MAX_PRICE = 10_000_000_000

const MODES = ['full', 'partial']
const PRODUCT_KEYS = ['erpProdukId', 'websiteProductId', 'name', 'variants']
const VARIANT_KEYS = ['sku', 'colour', 'price', 'available']
const ERP_ID_RE = /^[A-Za-z0-9._-]{1,64}$/
const WEBSITE_ID_RE = /^[A-Za-z0-9._-]{1,128}$/
const SKU_RE = /^[A-Za-z0-9._-]{1,64}$/
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u001f\u007f]/
const MAX_ERRORS = 20

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const unknownKeys = (value, allowed) => Object.keys(value).filter((key) => !allowed.includes(key))

/** Row id for a draft created from an ERP product. Deterministic, so creation is idempotent. */
export const draftIdFor = (erpProdukId) => `product-erp-${erpProdukId}`

/**
 * Strict validation. Unknown fields are rejected at every level.
 * @param {any} body
 * @returns {{errors: string[]} | {payload: {mode: 'full'|'partial', products: Array<{erpProdukId: string, websiteProductId: string|null, name: string, variants: Array<{sku: string, colour: string, price: number, available: boolean}>}>}}}
 */
export function validateErpPayload(body) {
  const errors = []
  const fail = (message) => { if (errors.length < MAX_ERRORS) errors.push(message) }

  if (!isPlainObject(body)) return {errors: ['Body must be a JSON object.']}
  for (const key of unknownKeys(body, ['mode', 'products'])) fail(`Unknown field "${key}".`)
  if (!MODES.includes(body.mode)) fail('mode must be "full" or "partial".')
  if (!Array.isArray(body.products)) fail('products must be an array.')
  else if (body.products.length > MAX_PRODUCTS) fail(`products must contain at most ${MAX_PRODUCTS} items.`)
  if (errors.length) return {errors}

  const seenErpIds = new Set()
  const seenWebsiteIds = new Set()
  const seenSkus = new Set()
  const products = []

  body.products.forEach((item, index) => {
    const at = `products[${index}]`
    if (!isPlainObject(item)) return fail(`${at} must be an object.`)
    for (const key of unknownKeys(item, PRODUCT_KEYS)) fail(`${at}: unknown field "${key}".`)
    for (const key of PRODUCT_KEYS) if (!(key in item)) fail(`${at}: "${key}" is required.`)

    if (typeof item.erpProdukId !== 'string' || !ERP_ID_RE.test(item.erpProdukId)) {
      fail(`${at}.erpProdukId must be a string of 1-64 characters (A-Z a-z 0-9 . _ -).`)
    } else if (seenErpIds.has(item.erpProdukId)) fail(`${at}.erpProdukId is duplicated in this request.`)
    else seenErpIds.add(item.erpProdukId)

    if (item.websiteProductId !== null && (typeof item.websiteProductId !== 'string' || !WEBSITE_ID_RE.test(item.websiteProductId))) {
      fail(`${at}.websiteProductId must be null or a product id string.`)
    } else if (item.websiteProductId) {
      if (seenWebsiteIds.has(item.websiteProductId)) fail(`${at}.websiteProductId is duplicated in this request.`)
      else seenWebsiteIds.add(item.websiteProductId)
    }

    const name = typeof item.name === 'string' ? item.name.trim() : ''
    if (!name || name.length > 120 || CONTROL_RE.test(name)) fail(`${at}.name must be 1-120 characters.`)

    if (!Array.isArray(item.variants) || item.variants.length < 1 || item.variants.length > MAX_VARIANTS) {
      return fail(`${at}.variants must be an array of 1-${MAX_VARIANTS} items.`)
    }

    const variants = []
    const productSkus = new Set()
    item.variants.forEach((variant, variantIndex) => {
      const vat = `${at}.variants[${variantIndex}]`
      if (!isPlainObject(variant)) return fail(`${vat} must be an object.`)
      for (const key of unknownKeys(variant, VARIANT_KEYS)) fail(`${vat}: unknown field "${key}".`)
      for (const key of VARIANT_KEYS) if (!(key in variant)) fail(`${vat}: "${key}" is required.`)

      if (typeof variant.sku !== 'string' || !SKU_RE.test(variant.sku)) fail(`${vat}.sku must be a string of 1-64 characters (A-Z a-z 0-9 . _ -).`)
      else {
        const key = variant.sku.toUpperCase()
        if (productSkus.has(key) || seenSkus.has(key)) fail(`${vat}.sku is duplicated in this request.`)
        productSkus.add(key)
        seenSkus.add(key)
      }
      const colour = typeof variant.colour === 'string' ? variant.colour.trim() : ''
      if (!colour || colour.length > 60 || CONTROL_RE.test(colour)) fail(`${vat}.colour must be 1-60 characters.`)
      if (!Number.isSafeInteger(variant.price) || variant.price < 0 || variant.price > MAX_PRICE) {
        fail(`${vat}.price must be an integer from 0 to ${MAX_PRICE} (whole rupiah).`)
      }
      if (typeof variant.available !== 'boolean') fail(`${vat}.available must be true or false.`)
      variants.push({sku: variant.sku, colour, price: variant.price, available: variant.available})
    })

    products.push({erpProdukId: item.erpProdukId, websiteProductId: item.websiteProductId, name, variants})
  })

  if (errors.length) return {errors}
  return {payload: {mode: body.mode, products}}
}

/**
 * The ERP-owned fields of a product row, derived from the payload.
 * `colors`, `sku`, `price` and `stockStatus` are the legacy fields the site
 * already reads; `erp` is the source of truth.
 * @param {{erpProdukId: string, name: string, variants: Array<{sku: string, colour: string, price: number, available: boolean}>}} product
 * @param {string} syncedAt ISO timestamp
 */
export function deriveErpFields(product, syncedAt) {
  const variants = product.variants.map(({sku, colour, price, available}) => ({sku, colour, price, available}))
  const colours = []
  for (const variant of variants) if (!colours.includes(variant.colour)) colours.push(variant.colour)
  return {
    name: product.name,
    sku: variants[0].sku,
    price: Math.min(...variants.map((variant) => variant.price)),
    currency: 'IDR',
    stockStatus: variants.some((variant) => variant.available) ? 'inStock' : 'soldOut',
    colors: colours,
    erp: {produkId: product.erpProdukId, variants, syncedAt},
  }
}

const canonical = (data) => JSON.stringify({
  name: data?.name,
  sku: data?.sku,
  price: data?.price,
  currency: data?.currency,
  stockStatus: data?.stockStatus,
  colors: data?.colors,
  produkId: data?.erp?.produkId,
  variants: data?.erp?.variants,
})

/** True when applying `derived` would not change anything (syncedAt is ignored). */
export const sameErpState = (data, derived) => canonical(data) === canonical(derived)

/** Keys written by a sync and locked in the admin for ERP-managed products. */
export const ERP_OWNED_KEYS = ['name', 'sku', 'price', 'currency', 'stockStatus', 'colors', 'erp']

/** @param {Record<string, any>} data */
export const erpOwnedFields = (data) => Object.fromEntries(ERP_OWNED_KEYS.filter((key) => key in data).map((key) => [key, data[key]]))

export const isErpManaged = (data) => Boolean(data?.erp?.produkId)

/**
 * Admin forms send the whole product. For an ERP-managed product, put the
 * stored ERP values back into the input before validation so a form edit can
 * neither change them nor fail validation because of them.
 */
export function lockErpFields(input, data) {
  return isErpManaged(data) ? {...input, ...erpOwnedFields(data)} : input
}

/**
 * Merge a validated admin edit into the stored data. ERP-managed products get
 * their ERP-owned fields restored last, so nothing in `product` can win.
 */
export function mergeAdminEdit(data, product, extra = {}) {
  const merged = {...data, ...product, ...extra}
  return isErpManaged(data) ? {...merged, ...erpOwnedFields(data)} : merged
}

const baseSlug = (name) => (
  String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/g, '') || 'product'
)

/** Slug candidates for a new draft: the name first, then the name plus the ERP id. */
export const draftSlugCandidates = (name, erpProdukId) => {
  const base = baseSlug(name)
  return [base, `${base}-${String(erpProdukId).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 96)]
}

/**
 * A hidden draft for an ERP product that has no website product yet. It holds
 * ERP data only; the owner adds photos, description and category in /admin and
 * publishes there.
 */
export function draftRowFor(product, derived, slug) {
  const id = draftIdFor(product.erpProdukId)
  return {
    id,
    type: 'product',
    slug,
    status: 'draft',
    display_order: 100,
    data: {
      ...derived,
      slug,
      status: 'draft',
      featured: false,
      displayOrder: 100,
      shortDescription: '',
      productStory: '',
      dimensions: '',
      weight: '',
      materials: [],
      benefits: [],
      madeToOrder: false,
      leadTime: '',
      whatsAppMessage: '',
      category: null,
      collection: null,
      mainImage: null,
      galleryImages: [],
    },
  }
}

/**
 * Constant-time check of "Authorization: Bearer <secret>". Both sides are
 * hashed first so the comparison length never depends on the input.
 * @param {string | undefined} header
 * @param {string} secret
 */
export function isAuthorized(header, secret) {
  const match = /^Bearer\s+(\S+)$/i.exec(String(header || '').trim())
  if (!match || !secret) return false
  const given = createHash('sha256').update(match[1]).digest()
  const expected = createHash('sha256').update(secret).digest()
  return timingSafeEqual(given, expected)
}
