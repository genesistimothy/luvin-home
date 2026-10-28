import {contentRow} from './supabase.js'

export async function resolveCollection(collectionId) {
  if (!collectionId) return null
  const row = await contentRow(collectionId)
  if (!row || row.type !== 'collection') throw new Error('Category not found.')
  return {id: row.id, name: row.data.name, slug: row.data.slug}
}

export function productFromRow(row) {
  return {
    ...row.data,
    _id: row.id,
    hasDraft: row.status === 'draft',
    _updatedAt: row.updated_at,
  }
}

export function productListItem(row) {
  return {
    _id: row.id,
    _updatedAt: row.updated_at,
    name: row.data.name,
    slug: row.data.slug,
    sku: row.data.sku,
    status: row.data.status,
    featured: row.data.featured,
    displayOrder: row.data.displayOrder,
    price: row.data.price,
    currency: row.data.currency,
    category: row.data.collection?.name || null,
    categoryId: row.data.collection?.id || null,
    mainImage: row.data.mainImage || null,
    hasDraft: row.status === 'draft',
  }
}
