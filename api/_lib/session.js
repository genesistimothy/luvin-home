import {createHmac, randomBytes, timingSafeEqual} from 'node:crypto'
import {parseCookies, requestOrigin} from './http.js'

export const SESSION_COOKIE = 'luvin_admin_session'
export const OAUTH_COOKIE = 'luvin_admin_oauth'

const secret = () => {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value || value.length < 32) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters.')
  return value
}

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
const signature = (value) => createHmac('sha256', secret()).update(value).digest('base64url')

export function signValue(value) {
  const payload = encode(value)
  return `${payload}.${signature(payload)}`
}

export function verifyValue(value) {
  if (!value || !value.includes('.')) return null
  const [payload, supplied] = value.split('.')
  const expected = signature(payload)
  const suppliedBuffer = Buffer.from(supplied)
  const expectedBuffer = Buffer.from(expected)
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return decoded.exp > Date.now() ? decoded : null
  } catch {
    return null
  }
}

export function allowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedEmail(email) {
  return allowedEmails().includes(String(email || '').trim().toLowerCase())
}

export function sessionFromRequest(req) {
  return verifyValue(parseCookies(req.headers.cookie)[SESSION_COOKIE])
}

export function createOAuthState() {
  return {
    state: randomBytes(24).toString('base64url'),
    nonce: randomBytes(24).toString('base64url'),
    exp: Date.now() + 10 * 60 * 1000,
  }
}

const secureCookie = (req) => requestOrigin(req).startsWith('https://') ? '; Secure' : ''
const appendCookie = (res, value) => {
  const existing = res.getHeader?.('Set-Cookie')
  res.setHeader('Set-Cookie', existing ? [...(Array.isArray(existing) ? existing : [existing]), value] : value)
}

export function setOAuthCookie(req, res, value) {
  appendCookie(res, `${OAUTH_COOKIE}=${encodeURIComponent(signValue(value))}; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=600${secureCookie(req)}`)
}

export function clearOAuthCookie(req, res) {
  appendCookie(res, `${OAUTH_COOKIE}=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0${secureCookie(req)}`)
}

export function oauthStateFromRequest(req) {
  return verifyValue(parseCookies(req.headers.cookie)[OAUTH_COOKIE])
}

export function setSessionCookie(req, res, user) {
  const value = signValue({...user, exp: Date.now() + 8 * 60 * 60 * 1000})
  appendCookie(res, `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secureCookie(req)}`)
}

export function clearSessionCookie(req, res) {
  appendCookie(res, `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookie(req)}`)
}

export function sameOrigin(req) {
  const origin = req.headers.origin
  return !origin || origin === requestOrigin(req)
}
