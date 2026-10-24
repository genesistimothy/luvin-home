import assert from 'node:assert/strict'
import test from 'node:test'
import {requireAdmin} from '../api/_lib/auth.js'
import {SESSION_COOKIE, isAllowedEmail, setSessionCookie, signValue, verifyValue} from '../api/_lib/session.js'

Object.assign(process.env, {
  ADMIN_SESSION_SECRET: 'test-secret-that-is-longer-than-thirty-two-characters',
  ADMIN_ALLOWED_EMAILS: 'owner@example.com, editor@example.com',
})

function response() {
  return {statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value }, end(value) { this.body = value }}
}

const notRevoked = {isRevoked: async () => false}
const sessionCookie = (token) => ({cookie: `${SESSION_COOKIE}=${encodeURIComponent(token)}`})
const request = (headers, method = 'GET') => ({method, headers})
const freshToken = (extra = {}) => signValue({email: 'owner@example.com', name: 'Owner', jti: 'jti-abc', exp: Date.now() + 60_000, ...extra})

test('allowlist normalizes approved emails', () => {
  assert.equal(isAllowedEmail(' OWNER@example.com '), true)
  assert.equal(isAllowedEmail('intruder@example.com'), false)
})

test('signed session rejects tampering', () => {
  const token = signValue({email: 'owner@example.com', exp: Date.now() + 60_000})
  assert.equal(verifyValue(token).email, 'owner@example.com')
  assert.equal(verifyValue(`${token}x`), null)
})

test('signed session can expire', () => {
  const token = signValue({email: 'owner@example.com', exp: Date.now() - 1_000})
  assert.equal(verifyValue(token), null)
})

test('protected API rejects unauthenticated access', async () => {
  const res = response()
  assert.equal(await requireAdmin(request({}), res, notRevoked), null)
  assert.equal(res.statusCode, 401)
})

test('protected API allows approved signed session', async () => {
  const res = response()
  const session = await requireAdmin(request(sessionCookie(freshToken())), res, notRevoked)
  assert.equal(session.email, 'owner@example.com')
})

test('signed session for a non-allowlisted email is rejected', async () => {
  const res = response()
  const session = await requireAdmin(request(sessionCookie(freshToken({email: 'intruder@example.com'}))), res, notRevoked)
  assert.equal(session, null)
  assert.equal(res.statusCode, 403)
})

test('state-changing request without an Origin header is rejected', async () => {
  const res = response()
  assert.equal(await requireAdmin(request(sessionCookie(freshToken()), 'POST'), res, notRevoked), null)
  assert.equal(res.statusCode, 403)
})

test('state-changing request with a foreign Origin is rejected', async () => {
  const res = response()
  const session = await requireAdmin({
    method: 'POST',
    headers: {host: 'luvin-home.vercel.app', 'x-forwarded-proto': 'https', origin: 'https://evil.example', ...sessionCookie(freshToken())},
  }, res, notRevoked)
  assert.equal(session, null)
  assert.equal(res.statusCode, 403)
})

test('a revoked session is rejected', async () => {
  const res = response()
  const session = await requireAdmin(request(sessionCookie(freshToken())), res, {isRevoked: async () => true})
  assert.equal(session, null)
  assert.equal(res.statusCode, 401)
})

test('an unavailable revocation store fails closed', async () => {
  const res = response()
  const session = await requireAdmin(request(sessionCookie(freshToken())), res, {
    isRevoked: async () => { throw new Error('sanity down') },
  })
  assert.equal(session, null)
  assert.equal(res.statusCode, 503)
})

test('session cookie is host-locked, secure, and http-only', () => {
  const res = response()
  setSessionCookie({headers: {host: 'luvin-home.vercel.app', 'x-forwarded-proto': 'https'}}, res, {email: 'owner@example.com'})
  const header = res.headers['Set-Cookie']
  assert.match(header, /^__Host-luvin_admin_session=/)
  assert.match(header, /; Secure/)
  assert.match(header, /; HttpOnly/)
  assert.match(header, /Path=\//)
  assert.doesNotMatch(header, /Domain=/)
})

test('a new session carries a revocable id', () => {
  const token = signValue({email: 'owner@example.com', exp: Date.now() + 60_000})
  assert.equal(verifyValue(token).jti, undefined)
  const decoded = verifyValue(setSessionCookieValue())
  assert.match(decoded.jti, /^[A-Za-z0-9_-]{16}$/)
})

function setSessionCookieValue() {
  const res = response()
  setSessionCookie({headers: {host: 'luvin-home.vercel.app', 'x-forwarded-proto': 'https'}}, res, {email: 'owner@example.com'})
  return decodeURIComponent(res.headers['Set-Cookie'].split(';')[0].split('=').slice(1).join('='))
}
