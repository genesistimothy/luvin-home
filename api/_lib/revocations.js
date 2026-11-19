import {insertSessionRevocation, sessionRevocationExists} from './supabase.js'

/**
 * Server-side session revocation.
 *
 * Sessions are stateless signed cookies, so the only way to end one before its
 * exp is to remember that it ended. Logout stores the token's jti with its
 * expiry; requireAdmin checks for it. The store is Supabase
 * (public.session_revocations, service role only).
 */

const supabaseStore = {
  insert: insertSessionRevocation,
  exists: sessionRevocationExists,
}

/**
 * Record a session as ended. Idempotent: logging out twice keeps one row.
 * @param {{jti?: string, exp?: number}} session
 * @param {{insert: (row: {jti: string, expires_at: string}) => Promise<unknown>}} [store]
 */
export async function revokeSession(session, store = supabaseStore) {
  if (!session?.jti) return false
  await store.insert({
    jti: session.jti,
    expires_at: new Date(Number(session.exp) || Date.now()).toISOString(),
  })
  return true
}

/**
 * Whether a session id has been revoked. Throws if the store cannot answer;
 * callers must fail closed.
 * @param {string} jti
 * @param {{exists: (jti: string) => Promise<boolean>}} [store]
 */
export async function isSessionRevoked(jti, store = supabaseStore) {
  if (!jti) return false
  return Boolean(await store.exists(jti))
}
