import assert from 'node:assert/strict'
import test from 'node:test'
import {REVOCATION_TYPE, isSessionRevoked, revocationId, revokeSession} from '../api/_lib/revocations.js'

const session = {jti: 'abc123', exp: Date.now() + 3_600_000}

const readClient = (found) => ({fetch: async () => found})
const writeClient = (onCreate) => ({createIfNotExists: async (doc) => { onCreate?.(doc); return doc }})

test('revocation id is derived from the session id', () => {
  assert.equal(revocationId('abc123'), 'session-revocation-abc123')
})

test('revoking writes one document carrying the token expiry', async () => {
  let written
  const result = await revokeSession(session, writeClient((doc) => { written = doc }))
  assert.equal(result, true)
  assert.equal(written._id, 'session-revocation-abc123')
  assert.equal(written._type, REVOCATION_TYPE)
  assert.equal(written.jti, 'abc123')
  assert.equal(written.expiresAt, new Date(session.exp).toISOString())
})

test('a session without a jti is not revocable', async () => {
  let called = false
  const result = await revokeSession({email: 'owner@example.com'}, writeClient(() => { called = true }))
  assert.equal(result, false)
  assert.equal(called, false)
})

test('isSessionRevoked reports whether the document exists', async () => {
  assert.equal(await isSessionRevoked('abc123', readClient(null)), false)
  assert.equal(await isSessionRevoked('abc123', readClient({_id: 'x'})), true)
})

test('isSessionRevoked without a jti never queries', async () => {
  let called = false
  const result = await isSessionRevoked('', {fetch: async () => { called = true; return null }})
  assert.equal(result, false)
  assert.equal(called, false)
})
