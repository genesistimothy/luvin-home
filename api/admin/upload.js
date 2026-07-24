import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {sanityWriteClient} from '../_lib/sanity.js'

export const config = {api: {bodyParser: false}}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return json(res, 405, {error: 'Method not allowed.'})
  const type = String(req.headers['content-type'] || '').split(';')[0]
  const size = Number(req.headers['content-length'] || 0)
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) return json(res, 415, {error: 'Use a JPG, PNG, or WebP image.'})
  if (!size || size > 4 * 1024 * 1024) return json(res, 413, {error: 'Image must be 4 MB or smaller.'})
  const filename = decodeURIComponent(String(req.headers['x-file-name'] || 'product-image')).replace(/[^a-zA-Z0-9._-]/g, '-')
  try {
    const asset = await sanityWriteClient().assets.upload('image', req, {filename, contentType: type})
    return json(res, 201, {asset: {_id: asset._id, url: asset.url, metadata: asset.metadata?.dimensions}})
  } catch {
    return json(res, 500, {error: 'Image upload failed.'})
  }
}
