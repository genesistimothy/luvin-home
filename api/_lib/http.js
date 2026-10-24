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

export function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=')
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))]
      }),
  )
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

/**
 * Origins this deployment trusts for state-changing browser requests.
 *
 * Built from Vercel's server-set environment (never from request headers): a
 * caller can forge Origin, Host and X-Forwarded-* but cannot set VERCEL_URL.
 * Local development has no such metadata, so the caller falls back to the
 * request's own origin.
 */
export function trustedOrigins() {
  return [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]
    .filter(Boolean)
    .map((value) => `https://${String(value).replace(/^https?:\/\//, '').replace(/\/.*$/, '')}`)
}

export function isTrustedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return false
  const allowed = trustedOrigins()
  return allowed.length ? allowed.includes(origin) : origin === requestOrigin(req)
}
