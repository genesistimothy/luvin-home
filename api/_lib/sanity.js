import {createClient} from '@sanity/client'

const config = () => ({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'p3ihfsxq',
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || '2025-02-19',
  useCdn: false,
})

export function sanityReadClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  return createClient({...config(), token, perspective: token ? 'raw' : 'published'})
}

export function sanityWriteClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) throw new Error('SANITY_WRITE_TOKEN is not configured.')
  return createClient({...config(), token, perspective: 'raw'})
}

export function baseDocumentId(id = '') {
  const normalized = String(id).replace(/^drafts\./, '')
  if (!/^[a-zA-Z0-9._-]{1,128}$/.test(normalized)) throw new Error('Invalid document id.')
  return normalized
}

const string = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const list = (value, maxItems = 20) => Array.isArray(value) ? value.map((item) => string(item, 180)).filter(Boolean).slice(0, maxItems) : []

export function validateProductInput(input) {
  const status = ['draft', 'active', 'soldOut', 'comingSoon', 'archived'].includes(input.status) ? input.status : 'draft'
  const name = string(input.name, 120)
  const slug = string(input.slug?.current || input.slug, 96).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '')
  const price = Number(input.price)
  const materials = list(input.materials)
  const benefits = list(input.benefits)
  const collectionId = input.collection?._ref ? baseDocumentId(input.collection._ref) : ''
  const assetId = input.mainImage?.image?.asset?._ref || input.mainImage?.image?.asset?._id

  const errors = []
  if (!name) errors.push('Product name is required.')
  if (!slug) errors.push('Slug is required.')
  if (!Number.isFinite(price) || price < 0) errors.push('Price must be zero or greater.')
  if (status === 'active') {
    if (!string(input.sku, 80)) errors.push('SKU is required for active products.')
    if (!collectionId) errors.push('Category is required for active products.')
    if (!assetId) errors.push('Main image is required for active products.')
    if (!materials.length && !benefits.length) errors.push('Add at least one material or benefit for active products.')
  }
  if (errors.length) return {errors}

  const product = {
    _type: 'product',
    name,
    slug: {_type: 'slug', current: slug},
    sku: string(input.sku, 80),
    status,
    featured: Boolean(input.featured),
    displayOrder: Math.max(0, Math.trunc(Number(input.displayOrder) || 0)),
    shortDescription: string(input.shortDescription, 280),
    productStory: string(input.productStory, 1000),
    price,
    currency: 'IDR',
    colors: list(input.colors),
    dimensions: string(input.dimensions, 180),
    weight: string(input.weight, 100),
    materials,
    benefits,
    stockStatus: ['inStock', 'lowStock', 'preOrder', 'madeToOrder', 'soldOut'].includes(input.stockStatus) ? input.stockStatus : 'inStock',
    madeToOrder: Boolean(input.madeToOrder),
    leadTime: string(input.leadTime, 180),
    whatsAppMessage: string(input.whatsAppMessage, 300),
  }
  if (collectionId) product.collection = {_type: 'reference', _ref: collectionId}
  if (assetId && /^image-[a-zA-Z0-9]+-\d+x\d+-[a-z0-9]+$/.test(assetId)) {
    product.mainImage = {
      _type: 'cmsImage',
      image: {_type: 'image', asset: {_type: 'reference', _ref: assetId}},
      altText: string(input.mainImage.altText, 160) || name,
      ...(string(input.mainImage.caption, 180) ? {caption: string(input.mainImage.caption, 180)} : {}),
    }
  }
  return {product}
}
