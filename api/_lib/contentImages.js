import {randomUUID} from 'node:crypto'
import {makeImageVariants} from './images.js'

const BUCKET = 'content'

const config = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase is not configured.')
  return {url: url.replace(/\/$/, ''), key}
}

/**
 * Store one image as high-quality WebP variants. Reseeding passes a stable
 * base so the same asset overwrites its own files.
 */
export async function uploadPublicImage(buffer, filename, base = randomUUID()) {
  const {url, key} = config()
  const headers = {apikey: key, Authorization: `Bearer ${key}`}
  const variants = await makeImageVariants(buffer)
  const stem = String(filename).replace(/\.[^.]+$/, '') || 'image'
  const uploaded = []

  for (const variant of variants) {
    const path = `${base}-${stem}-${variant.width}.webp`
    const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: {...headers, 'Content-Type': variant.contentType, 'x-upsert': 'true'},
      body: variant.buffer,
    })
    if (!response.ok) throw new Error(`Image upload failed with ${response.status}.`)
    uploaded.push({width: variant.width, url: `${url}/storage/v1/object/public/${BUCKET}/${path}`})
  }

  return {url: uploaded.at(-1).url, variants: uploaded}
}
