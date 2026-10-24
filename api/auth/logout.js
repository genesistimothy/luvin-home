import {json} from '../_lib/http.js'
import {revokeSession} from '../_lib/revocations.js'
import {clearSessionCookie, sameOrigin, sessionFromRequest} from '../_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, {error: 'Method not allowed.'})
  if (!sameOrigin(req)) return json(res, 403, {error: 'Invalid request origin.'})

  const session = sessionFromRequest(req)
  clearSessionCookie(req, res)

  // The cookie is already gone from this browser; if the write fails the token
  // stays valid until its exp, which is the pre-existing behaviour.
  if (session?.jti) {
    try {
      await revokeSession(session)
    } catch {
      // revocation is best effort; never fail the logout itself
    }
  }
  return json(res, 200, {ok: true})
}
