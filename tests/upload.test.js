import assert from 'node:assert/strict'
import test from 'node:test'
import {readImageRequest, safeFilename, sniffImageType, UploadError} from '../api/_lib/upload.js'

const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]), Buffer.alloc(32)])
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)])
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x20, 0x00, 0x00, 0x00]), Buffer.from('WEBPVP8 '), Buffer.alloc(32)])
const gif = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(32)])

/** @param {Buffer} body @param {Record<string,string>} headers */
function request(body, headers = {}) {
  return {headers, body, async *[Symbol.asyncIterator]() { yield body }}
}

test('sniffImageType identifies jpeg, png, and webp by magic bytes', () => {
  assert.equal(sniffImageType(jpeg), 'image/jpeg')
  assert.equal(sniffImageType(png), 'image/png')
  assert.equal(sniffImageType(webp), 'image/webp')
  assert.equal(sniffImageType(gif), null)
  assert.equal(sniffImageType(Buffer.alloc(4)), null)
})

test('upload rejects a file whose bytes are not an image', async () => {
  await assert.rejects(
    () => readImageRequest(request(gif, {'content-type': 'image/jpeg'})),
    (error) => error instanceof UploadError && error.status === 415,
  )
})

test('upload rejects bytes that do not match the declared type', async () => {
  await assert.rejects(
    () => readImageRequest(request(png, {'content-type': 'image/jpeg'})),
    (error) => error instanceof UploadError && error.status === 415,
  )
})

test('upload rejects a declared content type outside the allowlist', async () => {
  await assert.rejects(
    () => readImageRequest(request(jpeg, {'content-type': 'image/svg+xml'})),
    (error) => error instanceof UploadError && error.status === 415,
  )
})

test('upload rejects a body larger than the claimed content length', async () => {
  const huge = Buffer.concat([jpeg, Buffer.alloc(5 * 1024 * 1024)])
  await assert.rejects(
    () => readImageRequest(request(huge, {'content-type': 'image/jpeg', 'content-length': '16'})),
    (error) => error instanceof UploadError && error.status === 413,
  )
})

test('upload rejects content-length above the cap before reading', async () => {
  await assert.rejects(
    () => readImageRequest(request(jpeg, {'content-type': 'image/jpeg', 'content-length': String(5 * 1024 * 1024)})),
    (error) => error instanceof UploadError && error.status === 413,
  )
})

test('upload accepts a valid jpeg and reports its real type', async () => {
  const {buffer, contentType} = await readImageRequest(request(jpeg, {'content-type': 'image/jpeg', 'content-length': String(jpeg.length)}))
  assert.equal(contentType, 'image/jpeg')
  assert.equal(buffer.length, jpeg.length)
})

test('filename sanitising keeps a safe name and strips path characters', () => {
  assert.equal(safeFilename('sofa%20photo.png', 'fallback'), 'sofa-photo.png')
  assert.equal(safeFilename('../../etc/passwd', 'fallback'), 'etc-passwd')
  assert.equal(safeFilename('', 'fallback'), 'fallback')
})
