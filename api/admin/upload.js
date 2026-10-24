import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {sanityWriteClient} from '../_lib/sanity.js'
import {readImageRequest, safeFilename, UploadError} from '../_lib/upload.js'

export const config = {api: {bodyParser: false}}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return
  if (req.method !== 'POST') return json(res, 405, {error: 'Method not allowed.'})

  try {
    const {buffer, contentType} = await readImageRequest(req)
    const filename = safeFilename(req.headers['x-file-name'], 'product-image')
    const asset = await sanityWriteClient().assets.upload('image', buffer, {filename, contentType})
    return json(res, 201, {asset: {_id: asset._id, url: asset.url, metadata: asset.metadata?.dimensions}})
  } catch (error) {
    if (error instanceof UploadError) return json(res, error.status, {error: error.message})
    return json(res, 500, {error: 'Image upload failed.'})
  }
}
