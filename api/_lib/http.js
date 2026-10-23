export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function redirect(res, location, status = 302) {
  res.statusCode = status
  res.setHeader('Location', location)
  res.setHeader('Cache-Control', 'no-store')
  res.end()
}

/**
 * Decode a percent-encoded value without letting malformed input throw.
 * A cookie of `x=%` used to raise URIError inside the handler and turn the
 * request into a 500.
 * @param {string} value
 */
const decode = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function parseCookies(header = '') {
  /** @type {Record<string, string>} */
  const cookies = {}
  for (const part of String(header || '').split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const index = trimmed.indexOf('=')
    if (index < 1) continue
    cookies[decode(trimmed.slice(0, index))] = decode(trimmed.slice(index + 1))
  }
  return cookies
}

export async function readJson(req, maxBytes = 128_000) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) throw new Error('Request body is too large.')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function requestOrigin(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  return `${protocol}://${host}`
}
