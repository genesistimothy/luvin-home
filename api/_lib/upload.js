/**
 * Shared image-upload guards.
 *
 * `Content-Type` and `Content-Length` are client-supplied and cannot be trusted:
 * the type is checked against the file's own header bytes, and the size is
 * enforced by counting the stream rather than believing the header.
 */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Identify an image by its magic bytes.
 * @param {Buffer} buffer
 * @returns {'image/jpeg'|'image/png'|'image/webp'|null}
 */
export function sniffImageType(buffer) {
  if (!buffer || buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

/**
 * Read a request body into a Buffer with a hard cap.
 * @param {import('node:http').IncomingMessage} req
 * @param {number} [maxBytes]
 * @returns {Promise<Buffer>}
 */
export async function readBodyWithCap(req, maxBytes = MAX_IMAGE_BYTES) {
  const buffered = /** @type {any} */ (req).body
  if (Buffer.isBuffer(buffered)) {
    if (buffered.length > maxBytes) throw new UploadError(413, 'Image size must be 4 MB or less.')
    return buffered
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) throw new UploadError(413, 'Image size must be 4 MB or less.')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export class UploadError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   */
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/**
 * Read and validate an image request body.
 * @param {import('node:http').IncomingMessage} req
 * @param {number} [maxBytes]
 * @returns {Promise<{buffer: Buffer, contentType: string}>}
 */
export async function readImageRequest(req, maxBytes = MAX_IMAGE_BYTES) {
  const declared = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  if (!IMAGE_TYPES.includes(declared)) {
    throw new UploadError(415, 'Please use a JPG, PNG, or WebP image.')
  }
  const declaredLength = Number(req.headers['content-length'] || 0)
  if (declaredLength > maxBytes) throw new UploadError(413, 'Image size must be 4 MB or less.')

  const buffer = await readBodyWithCap(req, maxBytes)
  const actual = sniffImageType(buffer)
  if (!actual) throw new UploadError(415, 'File is not a valid JPG, PNG, or WebP image.')
  if (actual !== declared) throw new UploadError(415, 'File content does not match its declared type.')
  return { buffer, contentType: actual }
}

/**
 * Sanitize a client-supplied filename for the asset store.
 * @param {string} value
 * @param {string} fallback
 */
export function safeFilename(value, fallback) {
  let decoded = String(value || fallback)
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    // keep the raw value; the filter below handles anything unsafe
  }
  return decoded.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^[.-]+/, '').slice(0, 120) || fallback
}
