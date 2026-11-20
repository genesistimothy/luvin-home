import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_PRODUCTS,
  MAX_VARIANTS,
  deriveErpFields,
  draftIdFor,
  isAuthorized,
  isErpManaged,
  lockErpFields,
  mergeAdminEdit,
  sameErpState,
  validateErpPayload,
} from '../api/_lib/erp.js'
import {handleErpSync} from '../api/_lib/erpSync.js'
import {validateProductInput} from '../api/_lib/product.js'
import {erpPriceInfo, hasColourLabels} from '../src/lib/erpVariants.js'

const SECRET = 'test-erp-secret-with-enough-length'
const NOW = '2026-11-20T03:00:00.000Z'
// Postgres jsonb does not keep the key order you wrote: it stores object keys shorter-first, then
// alphabetically ({sku, colour, price, available} comes back as {sku, price, colour, available}).
// The test store behaves the same way, so tests see what the real database returns.
const jsonbLike = (value) => {
  if (Array.isArray(value)) return value.map(jsonbLike)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0))
        .map((key) => [key, jsonbLike(value[key])]),
    )
  }
  return value
}
const clone = (value) => (value === null || value === undefined ? value : jsonbLike(JSON.parse(JSON.stringify(value))))

const variant = (overrides = {}) => ({sku: 'ELO-HIT', colour: 'Hitam', price: 1_500_000, available: true, ...overrides})
const erpProduct = (overrides = {}) => ({
  erpProdukId: 'P-100',
  websiteProductId: null,
  name: 'Elora Dining Chair Set 4',
  variants: [variant(), variant({sku: 'ELO-CRM', colour: 'Krem', price: 1_600_000, available: false})],
  ...overrides,
})
const payload = (products = [erpProduct()], mode = 'full') => ({mode, products})

// ---- fakes -------------------------------------------------------------

function fakeStore(initial = []) {
  const rows = new Map(initial.map((row) => [row.id, clone(row)]))
  let clock = 0
  const touch = (row) => { clock += 1; row.updated_at = `2026-11-19T00:00:${String(clock).padStart(2, '0')}.000+00:00` }
  for (const row of rows.values()) touch(row)
  const store = {
    rows,
    writes: 0,
    getRow: async (id) => clone(rows.get(id) || null),
    findByErpId: async (produkId) => clone([...rows.values()].find((row) => row.type === 'product' && row.data?.erp?.produkId === produkId) || null),
    listErpProdukIds: async () => [...rows.values()].filter((row) => row.type === 'product' && row.data?.erp?.produkId).map((row) => row.data.erp.produkId),
    insertIfAbsent: async (row) => {
      if (rows.has(row.id)) return false
      if ([...rows.values()].some((other) => other.type === row.type && other.slug === row.slug)) {
        throw Object.assign(new Error('slug taken'), {status: 409})
      }
      const stored = clone(row)
      touch(stored)
      rows.set(row.id, stored)
      store.writes += 1
      return true
    },
    updateIfUnchanged: async (id, expectedUpdatedAt, patch) => {
      const row = rows.get(id)
      if (!row || row.updated_at !== expectedUpdatedAt) return false
      Object.assign(row, clone(patch))
      touch(row)
      store.writes += 1
      return true
    },
  }
  return store
}

const websiteRow = (overrides = {}) => ({
  id: 'product-aurelia',
  type: 'product',
  slug: 'aurelia-131-dining-set',
  status: 'published',
  display_order: 4,
  data: {
    name: 'Aurelia Dining Set',
    slug: 'aurelia-131-dining-set',
    sku: 'LUV-004',
    status: 'active',
    price: 2_499_000,
    currency: 'IDR',
    stockStatus: 'inStock',
    colors: [],
    shortDescription: 'Website description',
    productStory: 'Website story',
    category: 'Dining Collection',
    collection: {id: 'collection-dining', name: 'Dining Collection', slug: 'dining-collection'},
    mainImage: {url: 'https://img.example/main.webp'},
    galleryImages: [{url: 'https://img.example/g1.webp'}],
    materials: ['Oak'],
    benefits: ['Durable'],
    displayOrder: 4,
    featured: true,
  },
  ...overrides,
})

const response = () => ({
  statusCode: 200,
  headers: {},
  setHeader(name, value) { this.headers[name] = value },
  end(value) { this.body = value },
  get json() { return JSON.parse(this.body) },
})
const request = (body, {method = 'POST', token = SECRET} = {}) => ({
  method,
  headers: token === null ? {} : {authorization: `Bearer ${token}`},
  body,
})
const run = async (body, store, options = {}) => {
  const res = response()
  await handleErpSync(request(body, options), res, {secret: 'secret' in options ? options.secret : SECRET, store, now: () => NOW})
  return res
}

// ---- auth --------------------------------------------------------------

test('an unconfigured secret fails closed with 503, even for a correct-looking header', async () => {
  const res = await run(payload(), fakeStore(), {secret: undefined})
  assert.equal(res.statusCode, 503)
  const empty = await run(payload(), fakeStore(), {secret: ''})
  assert.equal(empty.statusCode, 503)
})

test('a missing, malformed or wrong secret is rejected with 401 and nothing is written', async () => {
  const store = fakeStore()
  for (const token of [null, 'wrong-secret', '', SECRET + 'x', SECRET.slice(0, -1)]) {
    const res = await run(payload(), store, {token})
    assert.equal(res.statusCode, 401, `token ${JSON.stringify(token)}`)
  }
  const basic = response()
  await handleErpSync({method: 'POST', headers: {authorization: `Basic ${SECRET}`}, body: payload()}, basic, {secret: SECRET, store, now: () => NOW})
  assert.equal(basic.statusCode, 401)
  assert.equal(store.writes, 0)
})

test('isAuthorized compares the exact secret', () => {
  assert.equal(isAuthorized(`Bearer ${SECRET}`, SECRET), true)
  assert.equal(isAuthorized(`bearer ${SECRET}`, SECRET), true)
  assert.equal(isAuthorized(`Bearer ${SECRET} `, SECRET), true)
  assert.equal(isAuthorized(SECRET, SECRET), false)
  assert.equal(isAuthorized(undefined, SECRET), false)
  assert.equal(isAuthorized(`Bearer ${SECRET}`, ''), false)
})

test('only POST is accepted', async () => {
  const res = await run(payload(), fakeStore(), {method: 'GET'})
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.Allow, 'POST')
})

test('an oversized body is 413 and invalid JSON is 400', async () => {
  const big = await run('x'.repeat(600_000), fakeStore())
  assert.equal(big.statusCode, 413)
  const bad = await run('{not json', fakeStore())
  assert.equal(bad.statusCode, 400)
})

// ---- validation --------------------------------------------------------

test('a valid payload passes and is normalised', () => {
  const result = validateErpPayload(payload([erpProduct({name: '  Elora  '})], 'partial'))
  assert.ok('payload' in result)
  assert.equal(result.payload.mode, 'partial')
  assert.equal(result.payload.products[0].name, 'Elora')
})

test('unknown fields are rejected at every level', () => {
  assert.ok('errors' in validateErpPayload({...payload(), extra: 1}))
  assert.ok('errors' in validateErpPayload(payload([{...erpProduct(), photos: []}])))
  assert.ok('errors' in validateErpPayload(payload([erpProduct({variants: [{...variant(), stock: 5}]})])))
})

test('required fields, types and ranges are enforced', () => {
  const bad = (mutate) => assert.ok('errors' in validateErpPayload(mutate()), JSON.stringify(mutate()).slice(0, 120))
  bad(() => payload([erpProduct({erpProdukId: 100})]))
  bad(() => payload([erpProduct({erpProdukId: 'has space'})]))
  bad(() => payload([erpProduct({websiteProductId: 7})]))
  bad(() => payload([erpProduct({websiteProductId: '../x'})]))
  bad(() => payload([erpProduct({name: ''})]))
  bad(() => payload([erpProduct({name: 'x'.repeat(121)})]))
  bad(() => payload([erpProduct({variants: []})]))
  bad(() => payload([erpProduct({variants: [variant({price: -1})]})]))
  bad(() => payload([erpProduct({variants: [variant({price: 1.5})]})]))
  bad(() => payload([erpProduct({variants: [variant({price: '1000'})]})]))
  bad(() => payload([erpProduct({variants: [variant({available: 'yes'})]})]))
  bad(() => payload([erpProduct({variants: [variant({colour: null})]})]))
  bad(() => payload([erpProduct({variants: [variant({colour: 7})]})]))
  bad(() => payload([erpProduct({variants: [variant({colour: 'x'.repeat(61)})]})]))
  bad(() => payload([erpProduct({variants: [variant({sku: 'a b'})]})]))
  bad(() => ({mode: 'sync', products: []}))
  bad(() => ({mode: 'full'}))
  bad(() => [])
  const missingWebsiteId = erpProduct()
  delete missingWebsiteId.websiteProductId
  bad(() => payload([missingWebsiteId]))
})

test('duplicate ids and SKUs are rejected', () => {
  assert.ok('errors' in validateErpPayload(payload([erpProduct(), erpProduct({name: 'Other'})])))
  assert.ok('errors' in validateErpPayload(payload([erpProduct({websiteProductId: 'p-1'}), erpProduct({erpProdukId: 'P-2', websiteProductId: 'p-1'})])))
  assert.ok('errors' in validateErpPayload(payload([erpProduct({variants: [variant(), variant({colour: 'Putih'})]})])))
  assert.ok('errors' in validateErpPayload(payload([erpProduct(), erpProduct({erpProdukId: 'P-2'})])), 'SKU shared by two products')
})

test('size caps are enforced', () => {
  const many = Array.from({length: MAX_PRODUCTS + 1}, (_, i) => erpProduct({erpProdukId: `P-${i}`, variants: [variant({sku: `S-${i}`})]}))
  assert.ok('errors' in validateErpPayload(payload(many)))
  const variants = Array.from({length: MAX_VARIANTS + 1}, (_, i) => variant({sku: `V-${i}`, colour: `C${i}`}))
  assert.ok('errors' in validateErpPayload(payload([erpProduct({variants})])))
})

test('an invalid payload is a 400 with details and writes nothing', async () => {
  const store = fakeStore()
  const res = await run(payload([erpProduct({variants: [variant({price: -5})]})]), store)
  assert.equal(res.statusCode, 400)
  assert.ok(res.json.details.length > 0)
  assert.equal(store.writes, 0)
})

test('an empty colour is accepted and stored as an empty string; the key must still be present', async () => {
  for (const colour of ['', '   ']) {
    const result = validateErpPayload(payload([erpProduct({variants: [variant({colour})]})]))
    assert.ok('payload' in result, JSON.stringify(colour))
    assert.equal(result.payload.products[0].variants[0].colour, '')
  }
  const noKey = variant()
  delete noKey.colour
  assert.ok('errors' in validateErpPayload(payload([erpProduct({variants: [noKey]})])))

  const store = fakeStore()
  const res = await run(payload([erpProduct({variants: [variant({sku: 'LH-ARL-ARM', colour: '', price: 4_499_000})]})]), store)
  assert.equal(res.statusCode, 200)
  const draft = store.rows.get(draftIdFor('P-100'))
  assert.equal(draft.data.erp.variants[0].colour, '')
  assert.deepEqual(draft.data.colors, [], 'an empty colour is not listed as a colour')
  assert.equal(draft.data.price, 4_499_000)
})

test('empty colours are left out of the derived colour list, labelled ones are kept', () => {
  const derived = deriveErpFields(erpProduct({variants: [variant({colour: ''}), variant({sku: 'B', colour: 'Krem'}), variant({sku: 'C', colour: 'Krem'})]}), NOW)
  assert.deepEqual(derived.colors, ['Krem'])
  assert.equal(derived.erp.variants.length, 3, 'every variant is still stored')
})

test('colour labels: a single labelled variant shows its colour, empty colours show none, no labels skips the list', () => {
  const only = (...variants) => ({erp: {variants}})
  assert.equal(hasColourLabels(only(variant())), true, 'a single variant still shows its colour')
  assert.equal(hasColourLabels(only(variant({colour: ''}))), false, 'a single variant with an empty colour shows no label')
  assert.equal(hasColourLabels(only(variant({colour: '   '}))), false)
  assert.equal(hasColourLabels(only(variant({colour: ''}), variant({sku: 'B', colour: 'Krem'}))), true, 'mixed: the labelled one shows')
  assert.equal(hasColourLabels({}), false, 'products without ERP data are unaffected')
})

// ---- derived fields ----------------------------------------------------

test('price is the lowest colour price and stock follows colour availability', () => {
  const derived = deriveErpFields(erpProduct(), NOW)
  assert.equal(derived.price, 1_500_000)
  assert.equal(derived.stockStatus, 'inStock')
  assert.deepEqual(derived.colors, ['Hitam', 'Krem'])
  assert.equal('sku' in derived, false, 'the product code is never derived from the ERP')
  assert.equal(derived.erp.produkId, 'P-100')
  assert.equal(derived.erp.syncedAt, NOW)
  const allOut = deriveErpFields(erpProduct({variants: [variant({available: false}), variant({sku: 'B', colour: 'Krem', available: false})]}), NOW)
  assert.equal(allOut.stockStatus, 'soldOut')
})

test('same state ignores the sync time', () => {
  const a = deriveErpFields(erpProduct(), NOW)
  const b = deriveErpFields(erpProduct(), '2030-01-01T00:00:00.000Z')
  assert.equal(sameErpState(a, b), true)
  assert.equal(sameErpState(a, deriveErpFields(erpProduct({name: 'Renamed'}), NOW)), false)
})

// ---- sync behaviour ----------------------------------------------------

test('a mapped product gets only ERP-owned fields; website-owned fields are never touched', async () => {
  const store = fakeStore([websiteRow()])
  const before = clone(store.rows.get('product-aurelia'))
  const res = await run(payload([erpProduct({websiteProductId: 'product-aurelia', name: 'Aurelia 131 Dining Set (ERP)'})]), store)
  assert.equal(res.statusCode, 200)
  assert.deepEqual({updated: res.json.updated, created: res.json.created, unchanged: res.json.unchanged, failed: res.json.failed}, {updated: 1, created: 0, unchanged: 0, failed: 0})

  const after = store.rows.get('product-aurelia')
  // ERP-owned fields changed
  assert.equal(after.data.name, 'Aurelia 131 Dining Set (ERP)')
  assert.equal(after.data.price, 1_500_000)
  assert.deepEqual(after.data.colors, ['Hitam', 'Krem'])
  assert.equal(after.data.stockStatus, 'inStock')
  assert.equal(after.data.erp.produkId, 'P-100')
  // everything else is exactly as before, including the website product code
  assert.equal(after.data.sku, 'LUV-004')
  assert.notEqual(after.data.sku, 'ELO-HIT')
  for (const key of ['sku', 'slug', 'shortDescription', 'productStory', 'category', 'collection', 'mainImage', 'galleryImages', 'materials', 'benefits', 'displayOrder', 'featured', 'status']) {
    assert.deepEqual(after.data[key], before.data[key], key)
  }
  assert.equal(after.slug, before.slug)
  assert.equal(after.status, before.status)
  assert.equal(after.display_order, before.display_order)
})

test('the name changes but the slug never does', async () => {
  const store = fakeStore([websiteRow()])
  await run(payload([erpProduct({websiteProductId: 'product-aurelia', name: 'Completely Different Name'})]), store)
  const row = store.rows.get('product-aurelia')
  assert.equal(row.data.name, 'Completely Different Name')
  assert.equal(row.slug, 'aurelia-131-dining-set')
  assert.equal(row.data.slug, 'aurelia-131-dining-set')
})

test('change detection ignores the key order the database stores (jsonb reorders keys)', async () => {
  const store = fakeStore([websiteRow()])
  const body = payload([erpProduct({websiteProductId: 'product-aurelia'})])
  const first = await run(body, store)
  assert.equal(first.json.updated, 1)

  // the stored variants now have the database's key order, not the order the website writes
  const stored = store.rows.get('product-aurelia').data.erp.variants[0]
  assert.deepEqual(Object.keys(stored), ['sku', 'price', 'colour', 'available'])
  assert.notDeepEqual(Object.keys(stored), Object.keys(deriveErpFields(erpProduct(), NOW).erp.variants[0]))

  const writes = store.writes
  const second = await run(body, store)
  assert.deepEqual({u: second.json.updated, n: second.json.unchanged}, {u: 0, n: 1})
  assert.equal(store.writes, writes, 'an unchanged product must not be written again')
})

test('sameErpState: key order never matters, real differences always do', () => {
  const derived = deriveErpFields(erpProduct(), NOW)
  const reordered = JSON.parse(JSON.stringify(derived))
  reordered.erp.variants = reordered.erp.variants.map(({available, price, colour, sku}) => ({available, price, colour, sku}))
  assert.equal(sameErpState(reordered, derived), true)

  const flip = (change) => {
    const copy = JSON.parse(JSON.stringify(derived))
    change(copy.erp.variants[0])
    return copy
  }
  assert.equal(sameErpState(flip((v) => { v.available = !v.available }), derived), false)
  assert.equal(sameErpState(flip((v) => { v.price += 1 }), derived), false)
  assert.equal(sameErpState(flip((v) => { v.colour = 'Lain' }), derived), false)
  assert.equal(sameErpState(flip((v) => { v.sku = 'LAIN-1' }), derived), false)
  assert.equal(sameErpState({...reordered, name: 'Nama lain'}, derived), false)
  assert.equal(sameErpState({}, derived), false)
})

test('a replayed request is idempotent: nothing is written the second time', async () => {
  const store = fakeStore([websiteRow()])
  const body = payload([erpProduct({websiteProductId: 'product-aurelia'}), erpProduct({erpProdukId: 'P-200', name: 'New Thing', variants: [variant({sku: 'NEW-1'})]})])
  const first = await run(body, store)
  assert.deepEqual({u: first.json.updated, c: first.json.created, n: first.json.unchanged, f: first.json.failed}, {u: 1, c: 1, n: 0, f: 0})
  const writes = store.writes
  const rowsAfterFirst = JSON.stringify([...store.rows.values()])
  const second = await run(body, store)
  assert.equal(second.statusCode, 200)
  assert.deepEqual({u: second.json.updated, c: second.json.created, n: second.json.unchanged, f: second.json.failed}, {u: 0, c: 0, n: 2, f: 0})
  assert.equal(store.writes, writes)
  assert.equal(JSON.stringify([...store.rows.values()]), rowsAfterFirst)
})

test('an ERP product with no website product becomes one hidden draft, once', async () => {
  const store = fakeStore([websiteRow()])
  const res = await run(payload([erpProduct()]), store)
  assert.equal(res.json.created, 1)
  const draft = store.rows.get(draftIdFor('P-100'))
  assert.ok(draft)
  assert.equal(draft.status, 'draft')
  assert.equal(draft.data.status, 'draft')
  assert.equal(draft.slug, 'elora-dining-chair-set-4')
  assert.equal(draft.data.name, 'Elora Dining Chair Set 4')
  assert.equal(draft.data.sku, '', 'a draft gets no product code; the owner fills it in /admin')
  assert.equal(draft.data.price, 1_500_000)
  assert.equal(draft.data.erp.variants.length, 2)
  assert.equal(draft.data.mainImage, null)
  assert.equal(draft.data.collection, null)
  assert.deepEqual(draft.data.galleryImages, [])
  assert.equal(draft.data.shortDescription, '')
  // sending it again, with or without the mapping, never creates a second row
  await run(payload([erpProduct()]), store)
  await run(payload([erpProduct({websiteProductId: draftIdFor('P-100')})]), store)
  assert.equal([...store.rows.values()].filter((row) => row.data.erp?.produkId === 'P-100').length, 1)
  assert.equal(store.rows.size, 2)
})

test('a draft slug that is already taken gets the ERP id appended', async () => {
  const store = fakeStore([websiteRow({id: 'product-x', slug: 'elora-dining-chair-set-4'})])
  const res = await run(payload([erpProduct()]), store)
  assert.equal(res.json.created, 1)
  assert.equal(store.rows.get(draftIdFor('P-100')).slug, 'elora-dining-chair-set-4-p-100')
})

test('rows are never deleted and unlisted products are untouched, in either mode', async () => {
  const other = websiteRow({id: 'product-other', slug: 'other', data: {...websiteRow().data, slug: 'other', erp: {produkId: 'P-999', variants: [], syncedAt: 'x'}}})
  const store = fakeStore([websiteRow(), other])
  const snapshot = JSON.stringify(store.rows.get('product-other'))
  for (const mode of ['full', 'partial']) {
    const res = await run(payload([erpProduct({websiteProductId: 'product-aurelia'})], mode), store)
    assert.equal(res.statusCode, 200)
    assert.equal(res.json.mode, mode)
  }
  assert.equal(JSON.stringify(store.rows.get('product-other')), snapshot)
  assert.ok(store.rows.has('product-aurelia'))
  assert.equal(store.rows.size, 2)
})

test('mode full reports mapped products missing from the payload; partial does not; nothing is changed', async () => {
  const other = websiteRow({id: 'product-other', slug: 'other', data: {...websiteRow().data, slug: 'other', erp: {produkId: 'P-999', variants: [], syncedAt: 'x'}}})
  const another = websiteRow({id: 'product-another', slug: 'another', data: {...websiteRow().data, slug: 'another', erp: {produkId: 'P-555', variants: [], syncedAt: 'x'}}})
  const unmapped = websiteRow({id: 'product-unmapped', slug: 'unmapped'}) // no data.erp: never "missing"
  const store = fakeStore([websiteRow(), other, another, unmapped])
  const snapshot = JSON.stringify([other, another, unmapped].map((row) => store.rows.get(row.id)))

  const full = await run(payload([erpProduct({websiteProductId: 'product-aurelia'})], 'full'), store)
  assert.equal(full.statusCode, 200)
  assert.equal(full.json.missing, 2)
  assert.deepEqual(full.json.missingErpProdukIds, ['P-555', 'P-999'])

  const partial = await run(payload([erpProduct({websiteProductId: 'product-aurelia'})], 'partial'), store)
  assert.equal('missing' in partial.json, false)
  assert.equal('missingErpProdukIds' in partial.json, false)

  assert.equal(JSON.stringify([other, another, unmapped].map((row) => store.rows.get(row.id))), snapshot)
  assert.equal(store.rows.size, 4)
})

test('a product sent in the payload, or created by it, is not reported missing', async () => {
  const store = fakeStore([websiteRow()])
  const res = await run(payload([
    erpProduct({websiteProductId: 'product-aurelia'}),
    erpProduct({erpProdukId: 'P-200', name: 'Brand New', variants: [variant({sku: 'NEW-1'})]}),
  ], 'full'), store)
  assert.equal(res.json.missing, 0)
  assert.deepEqual(res.json.missingErpProdukIds, [])
})

test('the sync never overwrites the website product code', async () => {
  const store = fakeStore([websiteRow()])
  await run(payload([erpProduct({websiteProductId: 'product-aurelia', variants: [variant({sku: 'ERP-ONLY-1'})]})]), store)
  const row = store.rows.get('product-aurelia')
  assert.equal(row.data.sku, 'LUV-004')
  assert.equal(row.data.erp.variants[0].sku, 'ERP-ONLY-1')
  // a second sync with different ERP SKUs still leaves it alone
  await run(payload([erpProduct({websiteProductId: 'product-aurelia', variants: [variant({sku: 'ERP-ONLY-2'})]})]), store)
  assert.equal(store.rows.get('product-aurelia').data.sku, 'LUV-004')
})

test('failed products give 422 with the same counts plus only the failing ids; the rest is still applied', async () => {
  const store = fakeStore([websiteRow()])
  const res = await run(payload([
    erpProduct({erpProdukId: 'P-OK', websiteProductId: 'product-aurelia', variants: [variant({sku: 'OK-1'})]}),
    erpProduct({erpProdukId: 'P-BAD', websiteProductId: 'does-not-exist', variants: [variant({sku: 'BAD-1'})]}),
  ], 'partial'), store)
  assert.equal(res.statusCode, 422)
  assert.deepEqual(Object.keys(res.json).sort(), ['created', 'error', 'failed', 'failedErpProdukIds', 'mode', 'ok', 'received', 'unchanged', 'updated'])
  assert.equal(res.json.ok, false)
  assert.deepEqual({u: res.json.updated, c: res.json.created, n: res.json.unchanged, f: res.json.failed}, {u: 1, c: 0, n: 0, f: 1})
  assert.deepEqual(res.json.failedErpProdukIds, ['P-BAD'])
  assert.equal(res.json.received, res.json.updated + res.json.created + res.json.unchanged + res.json.failed)
  assert.equal(store.rows.get('product-aurelia').data.erp.produkId, 'P-OK')
  assert.equal(store.rows.size, 1)
})

test('a clean run is 200 with failed 0 and no failing-id list', async () => {
  const res = await run(payload([erpProduct()]), fakeStore())
  assert.equal(res.statusCode, 200)
  assert.equal(res.json.failed, 0)
  assert.equal('failedErpProdukIds' in res.json, false)
})

test('a draft id that is already used by an unrelated row fails; a concurrent creation counts as unchanged', async () => {
  const squatter = websiteRow({id: draftIdFor('P-100'), slug: 'squatter'})
  const blocked = await run(payload([erpProduct()]), fakeStore([squatter]))
  assert.equal(blocked.statusCode, 422)
  assert.deepEqual(blocked.json.failedErpProdukIds, ['P-100'])

  const store = fakeStore()
  const original = store.insertIfAbsent
  store.insertIfAbsent = async (row) => { await original(row); return false } // another request inserted it first
  const raced = await run(payload([erpProduct()]), store)
  assert.equal(raced.statusCode, 200)
  assert.equal(raced.json.unchanged, 1)
  assert.equal(raced.json.created, 0)
})

test('data.erp holds availability booleans only, never stock quantities', async () => {
  const store = fakeStore([websiteRow()])
  await run(payload([erpProduct({websiteProductId: 'product-aurelia'}), erpProduct({erpProdukId: 'P-200', name: 'Other', variants: [variant({sku: 'O-1'})]})]), store)
  for (const row of store.rows.values()) {
    if (!row.data.erp) continue
    for (const stored of row.data.erp.variants) {
      assert.deepEqual(Object.keys(stored).sort(), ['available', 'colour', 'price', 'sku'])
      assert.equal(typeof stored.available, 'boolean')
    }
    assert.deepEqual(Object.keys(row.data.erp).sort(), ['produkId', 'syncedAt', 'variants'])
    assert.doesNotMatch(JSON.stringify(row.data.erp), /stock|qty|quantity|jumlah|saldo/i)
  }
  // a quantity cannot get in: extra fields are rejected and `available` must be a boolean
  for (const extra of [{stock: 5}, {qty: 5}, {quantity: 5}, {stok: 5}]) {
    assert.ok('errors' in validateErpPayload(payload([erpProduct({variants: [{...variant(), ...extra}]})])), JSON.stringify(extra))
  }
  assert.ok('errors' in validateErpPayload(payload([erpProduct({variants: [variant({available: 5})]})])))
  assert.ok('errors' in validateErpPayload(payload([erpProduct({variants: [variant({available: '5'})]})])))
})

test('a mapping that points at a missing row, a non-product row, or another ERP product fails', async () => {
  const collection = {id: 'collection-1', type: 'collection', slug: 'c', status: 'published', display_order: 1, data: {name: 'C'}}
  const owned = websiteRow({id: 'product-owned', slug: 'owned', data: {...websiteRow().data, slug: 'owned', erp: {produkId: 'P-OTHER', variants: [], syncedAt: 'x'}}})
  const store = fakeStore([collection, owned])
  const body = payload([
    erpProduct({erpProdukId: 'P-1', websiteProductId: 'missing', variants: [variant({sku: 'A'})]}),
    erpProduct({erpProdukId: 'P-2', websiteProductId: 'collection-1', variants: [variant({sku: 'B'})]}),
    erpProduct({erpProdukId: 'P-3', websiteProductId: 'product-owned', variants: [variant({sku: 'C'})]}),
  ])
  const res = await run(body, store)
  assert.equal(res.statusCode, 422)
  assert.deepEqual({u: res.json.updated, c: res.json.created, f: res.json.failed}, {u: 0, c: 0, f: 3})
  assert.deepEqual(res.json.failedErpProdukIds, ['P-1', 'P-2', 'P-3'])
  assert.equal(store.rows.size, 2)
})

test('an ERP product already mapped to one row is not claimed by a second row', async () => {
  const mapped = websiteRow({id: 'product-a', slug: 'a', data: {...websiteRow().data, slug: 'a', ...deriveErpFields(erpProduct(), NOW)}})
  const second = websiteRow({id: 'product-b', slug: 'b', data: {...websiteRow().data, slug: 'b'}})
  const store = fakeStore([mapped, second])
  const res = await run(payload([erpProduct({websiteProductId: 'product-b'})]), store)
  assert.equal(res.statusCode, 422)
  assert.equal(res.json.failed, 1)
  assert.equal(store.rows.get('product-b').data.erp, undefined)
})

test('a row that changes during the sync is re-read and the sync still applies', async () => {
  const store = fakeStore([websiteRow()])
  const original = store.updateIfUnchanged
  let raced = false
  store.updateIfUnchanged = async (id, expected, patch) => {
    if (!raced) {
      raced = true
      const row = store.rows.get(id)
      row.data = {...row.data, shortDescription: 'Edited in admin meanwhile'}
      row.updated_at = '2026-11-19T09:00:00.000+00:00'
    }
    return original(id, expected, patch)
  }
  const res = await run(payload([erpProduct({websiteProductId: 'product-aurelia'})]), store)
  assert.equal(res.json.updated, 1)
  const row = store.rows.get('product-aurelia')
  assert.equal(row.data.shortDescription, 'Edited in admin meanwhile')
  assert.equal(row.data.price, 1_500_000)
})

test('a store failure returns 500 with the counts so far and is safe to retry', async () => {
  const store = fakeStore([websiteRow()])
  store.updateIfUnchanged = async () => { throw new Error('db down') }
  const res = await run(payload([erpProduct({websiteProductId: 'product-aurelia'})]), store)
  assert.equal(res.statusCode, 500)
  assert.equal(res.json.updated, 0)
  assert.doesNotMatch(res.body, /db down/)
})

test('the response contains counts only (and the missing report in full mode)', async () => {
  const partial = await run(payload([erpProduct()], 'partial'), fakeStore())
  assert.deepEqual(Object.keys(partial.json).sort(), ['created', 'failed', 'mode', 'ok', 'received', 'unchanged', 'updated'])
  const full = await run(payload([erpProduct()], 'full'), fakeStore())
  assert.deepEqual(Object.keys(full.json).sort(), ['created', 'failed', 'missing', 'missingErpProdukIds', 'mode', 'ok', 'received', 'unchanged', 'updated'])
})

// ---- admin cannot overwrite ERP fields ---------------------------------

test('an admin edit of an ERP-managed product keeps every ERP-owned field', () => {
  const data = {...websiteRow().data, ...deriveErpFields(erpProduct(), NOW)}
  assert.equal(isErpManaged(data), true)

  const formPayload = {
    ...data,
    name: 'Hacked name',
    sku: 'LUV-NEW',
    price: 1,
    stockStatus: 'soldOut',
    colors: ['Pink'],
    erp: {produkId: 'P-FAKE', variants: [], syncedAt: 'x'},
    shortDescription: 'New website description',
    productStory: 'New story',
  }
  const {product, errors} = validateProductInput(lockErpFields(formPayload, data))
  assert.equal(errors, undefined)
  const merged = mergeAdminEdit(data, product, {category: 'Dining Collection', galleryImages: data.galleryImages})

  assert.equal(merged.name, data.name)
  assert.equal(merged.price, data.price)
  assert.equal(merged.stockStatus, data.stockStatus)
  assert.deepEqual(merged.colors, data.colors)
  assert.deepEqual(merged.erp, data.erp)
  // website-owned fields do take the admin's edit, including the product code
  assert.equal(data.sku, 'LUV-004')
  assert.equal(merged.sku, 'LUV-NEW')
  assert.equal(merged.shortDescription, 'New website description')
  assert.equal(merged.productStory, 'New story')
})

test('a product without ERP data is edited exactly as before', () => {
  const data = websiteRow().data
  assert.equal(isErpManaged(data), false)
  const input = {...data, name: 'Renamed in admin', price: 123456, status: 'active', collection: {id: 'collection-dining'}}
  const {product, errors} = validateProductInput(lockErpFields(input, data))
  assert.equal(errors, undefined)
  const merged = mergeAdminEdit(data, product)
  assert.equal(merged.name, 'Renamed in admin')
  assert.equal(merged.price, 123456)
})

// ---- public display facts ----------------------------------------------

test('display facts: lowest price, "mulai dari" only when prices differ, "Habis" when all are out', () => {
  assert.deepEqual(erpPriceInfo({}), {hasVariants: false, lowest: null, differs: false, allSoldOut: false})
  const mixed = erpPriceInfo({erp: {variants: [variant(), variant({sku: 'B', colour: 'Krem', price: 1_600_000, available: false})]}})
  assert.deepEqual(mixed, {hasVariants: true, lowest: 1_500_000, differs: true, allSoldOut: false})
  const same = erpPriceInfo({erp: {variants: [variant(), variant({sku: 'B', colour: 'Krem'})]}})
  assert.equal(same.differs, false)
  const allOut = erpPriceInfo({erp: {variants: [variant({available: false}), variant({sku: 'B', colour: 'Krem', available: false})]}})
  assert.equal(allOut.allSoldOut, true)
  assert.equal(erpPriceInfo({erp: {variants: [variant({price: 0})]}}).lowest, null)
})
