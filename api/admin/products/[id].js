import {requireAdmin} from '../../_lib/auth.js'
import {json, readJson} from '../../_lib/http.js'
import {baseDocumentId, sanityReadClient, sanityWriteClient, validateProductInput} from '../../_lib/sanity.js'

const projection = `{
  _id,_updatedAt,name,slug,sku,status,featured,displayOrder,collection,shortDescription,productStory,
  price,currency,colors,dimensions,weight,materials,benefits,stockStatus,madeToOrder,leadTime,
  whatsAppMessage,mainImage{altText,caption,image{asset->{_id,url}}}
}`

/** @param {Record<string, any>} document */
function withoutSystemFields(document = {}) {
  const content = {...document}
  delete content._rev
  delete content._createdAt
  delete content._updatedAt
  return content
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  try {
    const id = baseDocumentId(req.query?.id)
    const client = sanityWriteClient()
    if (req.method === 'GET') {
      const product = await sanityReadClient().fetch(
        `coalesce(*[_id == $draft][0]${projection}, *[_id == $id][0]${projection})`,
        {id, draft: `drafts.${id}`},
      )
      if (!product) return json(res, 404, {error: 'Product not found.'})
      return json(res, 200, {product: {...product, _id: id, hasDraft: product._id.startsWith('drafts.')}})
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req)
      const {product, errors} = validateProductInput(body.product || {})
      if (errors) return json(res, 400, {error: errors.join(' '), fields: errors})
      const existing = await client.getDocument(`drafts.${id}`) || await client.getDocument(id) || {}
      const preserved = withoutSystemFields(existing)
      if (body.action === 'publish') {
        await client.transaction().createOrReplace({...preserved, ...product, _id: id, _type: 'product'}).delete(`drafts.${id}`).commit()
      } else {
        await client.createOrReplace({...preserved, ...product, _id: `drafts.${id}`, _type: 'product'})
      }
      return json(res, 200, {id, status: body.action === 'publish' ? 'published' : 'draft'})
    }

    if (req.method === 'DELETE') {
      const published = await client.getDocument(id)
      const transaction = client.transaction().delete(`drafts.${id}`)
      if (published) transaction.patch(id, (patch) => patch.set({status: 'archived'}))
      await transaction.commit()
      return json(res, 200, {id, status: 'archived'})
    }
    return json(res, 405, {error: 'Method not allowed.'})
  } catch (error) {
    return json(res, 500, {error: error.message === 'Invalid document id.' ? error.message : 'Product operation failed.'})
  }
}
