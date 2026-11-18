import {sanityReadClient, sanityWriteClient} from './sanity.js'

/**
 * Server-side session revocation.
 *
 * Sessions are stateless signed cookies, so the only way to end one before its
 * exp is to remember that it ended. Logout writes a small document keyed by the
 * token's jti; requireAdmin checks for it. Documents carry the token's expiry so
 * they can be pruned later without guessing.
 */

export const REVOCATION_TYPE = 'sessionRevocation'

/** @param {string} jti */
export const revocationId = (jti) => `session-revocation-${jti}`

/**
 * Record a session as ended. Idempotent: logging out twice creates one document.
 * @param {{jti?: string, exp?: number}} session
 * @param {import('@sanity/client').SanityClient} [client]
 */
export async function revokeSession(session, client = sanityWriteClient()) {
  if (!session?.jti) return false
  await client.createIfNotExists({
    _id: revocationId(session.jti),
    _type: REVOCATION_TYPE,
    jti: session.jti,
    expiresAt: new Date(Number(session.exp) || Date.now()).toISOString(),
  })
  return true
}

/**
 * Whether a session id has been revoked.
 * @param {string} jti
 * @param {import('@sanity/client').SanityClient} [client]
 */
export async function isSessionRevoked(jti, client = sanityReadClient()) {
  if (!jti) return false
  const found = await client.fetch(
    `*[_id == $id && _type == $type][0]{_id}`,
    {id: revocationId(jti), type: REVOCATION_TYPE},
  )
  return Boolean(found)
}
