import {randomUUID} from 'node:crypto'
import {requireAdmin} from '../../_lib/auth.js'
import {json, readJson} from '../../_lib/http.js'
import {sanityReadClient, sanityWriteClient, validateProductInput} from '../../_lib/sanity.js'

function mergeProducts(documents) {
  const products = new Map()
  for (const document of documents) {
    const baseId = document._id.replace(/^drafts\./, '')
    const current = products.get(baseId)
    const isDraft = document._id.startsWith('drafts.')
    if (!current || isDraft) products.set(baseId, {...document, _id: baseId, hasDraft: isDraft || current?.hasDraft})
  }
  return [...products.values()].sort((a, b) => String(b._updatedAt).localeCompare(String(a._updatedAt)))
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  try {
    if (req.method === 'GET') {
      const documents = await sanityReadClient().fetch(`*[_type == "product"] | order(_updatedAt desc){
        _id,_updatedAt,name,"slug":slug.current,sku,status,featured,displayOrder,price,currency,
        "category":collection->name,"categoryId":collection._ref,
        mainImage{altText,"url":image.asset->url}
      }`)
      return json(res, 200, {products: mergeProducts(documents)})
    }

    if (req.method === 'POST') {
      const body = await readJson(req)
      const {product, errors} = validateProductInput(body.product || {})
      if (errors) return json(res, 400, {error: errors.join(' '), fields: errors})
      const id = `product-${product.slug.current}-${randomUUID().slice(0, 8)}`
      const client = sanityWriteClient()
      if (body.action === 'publish') {
        await client.create({...product, _id: id})
      } else {
        await client.create({...product, _id: `drafts.${id}`})
      }
      return json(res, 201, {id, status: body.action === 'publish' ? 'published' : 'draft'})
    }
    return json(res, 405, {error: 'Method not allowed.'})
  } catch (error) {
    return json(res, 500, {error: error.message === 'Request body is too large.' ? error.message : 'Product operation failed.'})
  }
}
