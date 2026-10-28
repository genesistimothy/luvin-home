import assert from 'node:assert/strict'
import test from 'node:test'
import {validateProductInput} from '../api/_lib/product.js'

const activeProduct = {
  name: 'QA Chair', slug: 'qa-chair', sku: 'QA-001', status: 'active', price: 1200000,
  collection: {id: 'collection-dining-collection'}, materials: ['Solid wood'],
  mainImage: {url: 'https://example.com/chair.jpg', altText: 'QA chair'},
}

test('active product maps to the Supabase content shape', () => {
  const {product, errors} = validateProductInput(activeProduct)
  assert.equal(errors, undefined)
  assert.equal(product.slug, 'qa-chair')
  assert.deepEqual(product.collection, {id: 'collection-dining-collection'})
  assert.deepEqual(product.mainImage, {url: 'https://example.com/chair.jpg', altText: 'QA chair'})
})

test('legacy Sanity payloads still validate', () => {
  const {product, collectionId, errors} = validateProductInput({
    ...activeProduct,
    slug: {current: 'qa-chair'},
    collection: {_ref: 'collection-dining-collection'},
    mainImage: {image: {asset: {url: 'https://example.com/chair.jpg'}}, altText: 'QA chair'},
  })
  assert.equal(errors, undefined)
  assert.equal(product.collection.id, collectionId)
  assert.equal(product.mainImage.url, 'https://example.com/chair.jpg')
})

test('active product requires category, SKU, material, and image', () => {
  const {errors} = validateProductInput({name: 'Incomplete', slug: 'incomplete', status: 'active', price: 10})
  assert.equal(errors.length, 4)
})

test('draft product can be saved before active-only fields are complete', () => {
  const {product, errors} = validateProductInput({name: 'Early Draft', slug: 'early-draft', status: 'draft', price: 0})
  assert.equal(errors, undefined)
  assert.equal(product.status, 'draft')
})

test('admin validation enforces the Studio dimension and weight limits', () => {
  const {product, errors} = validateProductInput({
    ...activeProduct,
    dimensions: 'x'.repeat(200),
    weight: 'y'.repeat(100),
  })
  assert.equal(errors, undefined)
  assert.equal(product.dimensions.length, 120)
  assert.equal(product.weight.length, 40)
})
