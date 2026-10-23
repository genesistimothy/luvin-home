import {json, requestOrigin} from './_lib/http.js'
import {sanityWriteClient} from './_lib/sanity.js'
import {readImageRequest, safeFilename, UploadError} from './_lib/upload.js'

export const config = {api: {bodyParser: false}}

/**
 * This endpoint is deliberately anonymous — customers attach a reference image
 * before they have any session. That makes the guards below the only barrier:
 * a same-origin browser request, a file that really is an image, and a body
 * that is really capped (the declared Content-Length is not trusted).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, {error: 'Method not allowed.'})

  const origin = req.headers.origin
  if (!origin || origin !== requestOrigin(req)) return json(res, 403, {error: 'Invalid request origin.'})

  try {
    const {buffer, contentType} = await readImageRequest(req)
    const filename = safeFilename(req.headers['x-file-name'], 'reference-image')
    const asset = await sanityWriteClient().assets.upload('image', buffer, {filename, contentType})
    // the browser only needs the id; the image URL is built at render time
    return json(res, 201, {assetId: asset._id})
  } catch (error) {
    if (error instanceof UploadError) return json(res, error.status, {error: error.message})
    return json(res, 500, {error: 'Image upload failed.'})
  }
}
