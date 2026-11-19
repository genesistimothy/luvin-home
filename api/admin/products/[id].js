import {requireAdmin} from '../../_lib/auth.js'
import {isErpManaged, lockErpFields, mergeAdminEdit} from '../../_lib/erp.js'
import {json, readJson} from '../../_lib/http.js'
import {validateProductInput} from '../../_lib/product.js'
import {productFromRow, resolveCollection} from '../../_lib/productStore.js'
import {contentRow, patchContentRow, patchContentRowIfUnchanged} from '../../_lib/supabase.js'

const ID_RE = /^[a-zA-Z0-9._-]{1,128}$/
const ERP_CONFLICT = 'This product was just updated from the ERP. Reload the page and try again.'

/**
 * ERP-managed rows can change at any moment (the ERP syncs in the background),
 * so write them only if nothing changed since they were read; otherwise a stale
 * copy of the ERP fields could overwrite a fresh sync.
 */
async function saveProduct(row, patch) {
  if (!isErpManaged(row.data)) {
    await patchContentRow(row.id, patch)
    return true
  }
  return patchContentRowIfUnchanged(row.id, row.updated_at, patch)
}

function productId(req) {
  const id = String(req.query?.id || '')
  if (!ID_RE.test(id)) throw new Error('Invalid product id.')
  return id
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return
  try {
    const id = productId(req)
    const row = await contentRow(id)
    if (!row || row.type !== 'product') return json(res, 404, {error: 'Product not found.'})

    if (req.method === 'GET') {
      return json(res, 200, {product: productFromRow(row)})
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req)
      // Name, SKU, price, colours and stock come from the ERP for synced products; the form cannot change them.
      const {product, collectionId, errors} = validateProductInput(lockErpFields(body.product || {}, row.data))
      if (errors) return json(res, 400, {error: errors.join(' '), fields: errors})

      const collection = await resolveCollection(collectionId)
      const data = mergeAdminEdit(row.data, product, {
        category: collection?.name || null,
        collection,
        galleryImages: row.data.galleryImages || [],
      })
      const status = body.action === 'publish' ? 'published' : 'draft'
      if (!(await saveProduct(row, {data, slug: data.slug, status, display_order: data.displayOrder}))) {
        return json(res, 409, {error: ERP_CONFLICT})
      }
      return json(res, 200, {id, status})
    }

    if (req.method === 'DELETE') {
      if (!(await saveProduct(row, {data: {...row.data, status: 'archived'}, status: 'archived'}))) {
        return json(res, 409, {error: ERP_CONFLICT})
      }
      return json(res, 200, {id, status: 'archived'})
    }
    return json(res, 405, {error: 'Method not allowed.'})
  } catch (error) {
    if (error.message === 'Invalid product id.') return json(res, 400, {error: error.message})
    if (error.message === 'Category not found.') return json(res, 400, {error: error.message})
    if (error.status === 409) return json(res, 409, {error: 'Slug is already used by another product.'})
    return json(res, 500, {error: error.message === 'Request body is too large.' ? error.message : 'Product operation failed.'})
  }
}
