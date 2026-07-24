import {json} from './http.js'
import {isAllowedEmail, sameOrigin, sessionFromRequest} from './session.js'

export function requireAdmin(req, res) {
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
  return session
}
