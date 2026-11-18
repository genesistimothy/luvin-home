import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyTurnstile } from '../api/_lib/turnstile.js'

const request = { headers: { 'x-forwarded-for': '203.0.113.10' } }

function withEnv(values, fn) {
  const saved = {}
  for (const [key, value] of Object.entries(values)) {
    saved[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  return Promise.resolve(fn()).finally(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
}

test('Turnstile is skipped only outside production when no secret is set', async () => {
  await withEnv({ TURNSTILE_SECRET_KEY: undefined, VERCEL_ENV: undefined, NODE_ENV: 'development' }, async () => {
    assert.deepEqual(await verifyTurnstile(request, ''), { ok: true })
  })
  await withEnv({ TURNSTILE_SECRET_KEY: undefined, VERCEL_ENV: 'production', NODE_ENV: 'production' }, async () => {
    assert.deepEqual(await verifyTurnstile(request, ''), { ok: false, status: 503 })
  })
})

test('Turnstile requires a token when configured', async () => {
  await withEnv({ TURNSTILE_SECRET_KEY: 'secret' }, async () => {
    assert.deepEqual(await verifyTurnstile(request, ''), { ok: false, status: 400 })
  })
})

test('Turnstile accepts a valid siteverify response', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ json: async () => ({ success: true }) })
  try {
    await withEnv({ TURNSTILE_SECRET_KEY: 'secret' }, async () => {
      assert.deepEqual(await verifyTurnstile(request, 'token'), { ok: true })
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Turnstile rejects a failed siteverify response', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ json: async () => ({ success: false }) })
  try {
    await withEnv({ TURNSTILE_SECRET_KEY: 'secret' }, async () => {
      assert.deepEqual(await verifyTurnstile(request, 'token'), { ok: false, status: 400 })
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
