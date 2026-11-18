import {json} from './http.js'
import {isAllowedEmail, sameOrigin, sessionFromRequest} from './session.js'
import {isSessionRevoked} from './revocations.js'

/**
 * Gate for every admin route.
 *
 * The session is a signed cookie, so a token copied before logout stays
 * cryptographically valid. Logout therefore records the token's jti in Sanity
 * and this gate checks it on every request. A failed revocation lookup is a
 * 503, not a pass: admin routes need Sanity anyway, so failing open would
 * trade a real revocation for an outage that breaks the route regardless.
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {{isRevoked?: (jti: string) => Promise<boolean>}} [deps]
 */
export async function requireAdmin(req, res, deps = {}) {
  const isRevoked = deps.isRevoked || isSessionRevoked

  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !sameOrigin(req)) {
    json(res, 403, {error: 'Invalid request origin.'})
    return null
  }

  const session = sessionFromRequest(req)
  if (!session) {
    json(res, 401, {error: 'Authentication required.'})
    return null
  }
  if (!isAllowedEmail(session.email)) {
    json(res, 403, {error: 'Access denied.'})
    return null
  }

  try {
    if (session.jti && await isRevoked(session.jti)) {
      json(res, 401, {error: 'Session has ended.'})
      return null
    }
  } catch {
    json(res, 503, {error: 'Session check unavailable.'})
    return null
  }

  return session
}
