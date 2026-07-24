import assert from 'node:assert/strict'
import test from 'node:test'
import {requireAdmin} from '../api/_lib/auth.js'
import {isAllowedEmail, signValue, verifyValue} from '../api/_lib/session.js'

Object.assign(process.env, {
  ADMIN_SESSION_SECRET: 'test-secret-that-is-longer-than-thirty-two-characters',
  ADMIN_ALLOWED_EMAILS: 'owner@example.com, editor@example.com',
})

function response() {
  return {statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value }, end(value) { this.body = value }}
}

test('allowlist normalizes approved emails', () => {
  assert.equal(isAllowedEmail(' OWNER@example.com '), true)
  assert.equal(isAllowedEmail('intruder@example.com'), false)
})

test('signed session rejects tampering', () => {
  const token = signValue({email: 'owner@example.com', exp: Date.now() + 60_000})
  assert.equal(verifyValue(token).email, 'owner@example.com')
  assert.equal(verifyValue(`${token}x`), null)
})

test('protected API rejects unauthenticated access', () => {
  const res = response()
  const session = requireAdmin({method: 'GET', headers: {}}, res)
  assert.equal(session, null)
  assert.equal(res.statusCode, 401)
})

test('protected API allows approved signed session', () => {
  const token = signValue({email: 'owner@example.com', name: 'Owner', exp: Date.now() + 60_000})
  const res = response()
  const session = requireAdmin({method: 'GET', headers: {cookie: `luvin_admin_session=${encodeURIComponent(token)}`}}, res)
  assert.equal(session.email, 'owner@example.com')
  assert.equal(res.statusCode, 200)
})
