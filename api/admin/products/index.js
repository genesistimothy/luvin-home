import {randomUUID} from 'node:crypto'
import {requireAdmin} from '../../_lib/auth.js'
import {json, readJson} from '../../_lib/http.js'
import {validateProductInput} from '../../_lib/product.js'
import {productListItem, resolveCollection} from '../../_lib/productStore.js'
import {contentRows, saveContentRow} from '../../_lib/supabase.js'

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return
  try {
    if (req.method === 'GET') {
      const rows = await contentRows({type: 'product'})
      const products = rows
        .slice()
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
        .map(productListItem)
      return json(res, 200, {products})
    }

    if (req.method === 'POST') {
      const body = await readJson(req)
      const {product, collectionId, errors} = validateProductInput(body.product || {})
      if (errors) return json(res, 400, {error: errors.join(' '), fields: errors})

      const collection = await resolveCollection(collectionId)
      const id = `product-${randomUUID()}`
      const data = {...product, category: collection?.name || null, collection, galleryImages: []}
      const status = body.action === 'publish' ? 'published' : 'draft'
      await saveContentRow({id, type: 'product', slug: data.slug, status, display_order: data.displayOrder, data})
      return json(res, 201, {id, status})
    }
    return json(res, 405, {error: 'Method not allowed.'})
  } catch (error) {
    if (error.message === 'Category not found.') return json(res, 400, {error: error.message})
    if (error.status === 409) return json(res, 409, {error: 'Slug is already used by another product.'})
    return json(res, 500, {error: error.message === 'Request body is too large.' ? error.message : 'Product operation failed.'})
  }
}
