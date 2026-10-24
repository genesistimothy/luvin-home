import {json} from '../_lib/http.js'
import {isSessionRevoked} from '../_lib/revocations.js'
import {isAllowedEmail, sessionFromRequest} from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, {error: 'Method not allowed.'})
  const session = sessionFromRequest(req)
  if (!session) return json(res, 200, {authenticated: false})
  if (!isAllowedEmail(session.email)) return json(res, 200, {authenticated: false, denied: true})
  if (session.jti && await isSessionRevoked(session.jti)) return json(res, 200, {authenticated: false})
  return json(res, 200, {authenticated: true, user: {email: session.email, name: session.name, picture: session.picture}})
}
