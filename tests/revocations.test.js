import assert from 'node:assert/strict'
import test from 'node:test'
import {isSessionRevoked, revokeSession} from '../api/_lib/revocations.js'

const session = {jti: 'abc123', exp: Date.now() + 3_600_000}

const readStore = (found) => ({exists: async () => found})
const writeStore = (onInsert) => ({insert: async (row) => { onInsert?.(row); return row }})

test('revoking stores the session id with the token expiry', async () => {
  let written
  const result = await revokeSession(session, writeStore((row) => { written = row }))
  assert.equal(result, true)
  assert.equal(written.jti, 'abc123')
  assert.equal(written.expires_at, new Date(session.exp).toISOString())
})

test('a session without a jti is not revocable', async () => {
  let called = false
  const result = await revokeSession({email: 'owner@example.com'}, writeStore(() => { called = true }))
  assert.equal(result, false)
  assert.equal(called, false)
})

test('a failed write surfaces so the caller can decide', async () => {
  await assert.rejects(revokeSession(session, {insert: async () => { throw new Error('store down') }}), /store down/)
})

test('isSessionRevoked reports whether the row exists', async () => {
  assert.equal(await isSessionRevoked('abc123', readStore(false)), false)
  assert.equal(await isSessionRevoked('abc123', readStore(true)), true)
})

test('isSessionRevoked without a jti never queries', async () => {
  let called = false
  const result = await isSessionRevoked('', {exists: async () => { called = true; return false }})
  assert.equal(result, false)
  assert.equal(called, false)
})

test('isSessionRevoked propagates store errors so the gate fails closed', async () => {
  await assert.rejects(isSessionRevoked('abc123', {exists: async () => { throw new Error('store down') }}), /store down/)
})
