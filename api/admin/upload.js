import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {uploadPublicImage} from '../_lib/contentImages.js'
import {readImageRequest, safeFilename, UploadError} from '../_lib/upload.js'

export const config = {api: {bodyParser: false}}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return
  if (req.method !== 'POST') return json(res, 405, {error: 'Method not allowed.'})

  try {
    const {buffer} = await readImageRequest(req)
    const filename = safeFilename(req.headers['x-file-name'], 'product-image')
    const image = await uploadPublicImage(buffer, filename)
    return json(res, 201, image)
  } catch (error) {
    if (error instanceof UploadError) return json(res, error.status, {error: error.message})
    return json(res, 500, {error: 'Image upload failed.'})
  }
}
