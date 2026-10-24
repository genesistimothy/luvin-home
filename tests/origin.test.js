import assert from 'node:assert/strict'
import test from 'node:test'
import {isTrustedOrigin, trustedOrigins} from '../api/_lib/http.js'

const withEnv = (values, fn) => {
  const saved = {}
  for (const [k, v] of Object.entries(values)) {
    saved[k] = process.env[k]
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
  try {
    return fn()
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  }
}

test('trusted origins come from the deployment environment', () => {
  withEnv({VERCEL_PROJECT_PRODUCTION_URL: 'luvin-home.vercel.app', VERCEL_URL: undefined}, () => {
    assert.deepEqual(trustedOrigins(), ['https://luvin-home.vercel.app'])
  })
})

test('a forged Origin plus matching Host is rejected when the deployment origin is known', () => {
  withEnv({VERCEL_PROJECT_PRODUCTION_URL: 'luvin-home.vercel.app', VERCEL_URL: undefined}, () => {
    const request = {headers: {origin: 'https://evil.example', host: 'evil.example', 'x-forwarded-host': 'evil.example'}}
    assert.equal(isTrustedOrigin(request), false)
  })
})

test('the real origin is accepted', () => {
  withEnv({VERCEL_PROJECT_PRODUCTION_URL: 'luvin-home.vercel.app', VERCEL_URL: undefined}, () => {
    assert.equal(isTrustedOrigin({headers: {origin: 'https://luvin-home.vercel.app'}}), true)
  })
})

test('a preview deployment accepts its own Vercel URL', () => {
  withEnv({VERCEL_PROJECT_PRODUCTION_URL: 'luvin-home.vercel.app', VERCEL_URL: 'luvin-home-git-fix-x.vercel.app'}, () => {
    assert.equal(isTrustedOrigin({headers: {origin: 'https://luvin-home-git-fix-x.vercel.app'}}), true)
  })
})

test('without deployment metadata the request origin is the fallback (local dev)', () => {
  withEnv({VERCEL_PROJECT_PRODUCTION_URL: undefined, VERCEL_URL: undefined}, () => {
    assert.equal(isTrustedOrigin({headers: {origin: 'http://localhost:5173', host: 'localhost:5173', 'x-forwarded-proto': 'http'}}), true)
  })
})

test('a missing Origin is always rejected', () => {
  withEnv({VERCEL_PROJECT_PRODUCTION_URL: 'luvin-home.vercel.app'}, () => {
    assert.equal(isTrustedOrigin({headers: {host: 'luvin-home.vercel.app'}}), false)
  })
})
