import assert from 'node:assert/strict'
import test from 'node:test'
import {parseCookies, readJson} from '../api/_lib/http.js'

test('readJson rejects an oversized pre-parsed body', async () => {
  await assert.rejects(
    () => readJson({body: {message: 'x'.repeat(200_000)}}),
    /Request body is too large/,
  )
})

test('readJson accepts a pre-parsed body under the cap', async () => {
  assert.deepEqual(await readJson({body: {message: 'hello'}}), {message: 'hello'})
})

test('parseCookies tolerates malformed percent encoding', () => {
  assert.deepEqual(parseCookies('a=%E0%A4%A; b=ok'), {a: '%E0%A4%A', b: 'ok'})
})
