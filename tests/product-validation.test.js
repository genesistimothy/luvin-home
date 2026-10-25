import assert from 'node:assert/strict'
import test from 'node:test'
import {isProductDocument, validateProductInput} from '../api/_lib/sanity.js'

const activeProduct = {
  name: 'QA Chair', slug: 'qa-chair', sku: 'QA-001', status: 'active', price: 1200000,
  collection: {_ref: 'collection-dining-collection'}, materials: ['Solid wood'],
  mainImage: {image: {asset: {_ref: 'image-abc123-100x100-jpg'}}, altText: 'QA chair'},
}

test('active product accepts fields from the existing Sanity schema', () => {
  const result = validateProductInput(activeProduct)
  assert.equal(result.errors, undefined)
  assert.equal(result.product.slug.current, 'qa-chair')
  assert.equal(result.product.collection._ref, 'collection-dining-collection')
})

test('active product requires category, SKU, material, and image', () => {
  const result = validateProductInput({name: 'Incomplete', slug: 'incomplete', status: 'active', price: 10})
  assert.equal(result.errors.length, 4)
})

test('draft product can be saved before active-only fields are complete', () => {
  const result = validateProductInput({name: 'Early Draft', slug: 'early-draft', status: 'draft', price: 0})
  assert.equal(result.errors, undefined)
  assert.equal(result.product.status, 'draft')
})

test('admin product routes only accept product documents', () => {
  assert.equal(isProductDocument({_type: 'product'}), true)
  assert.equal(isProductDocument({_type: 'collection'}), false)
  assert.equal(isProductDocument({_type: 'inquiry'}), false)
  assert.equal(isProductDocument(null), true) // a missing document keeps the 404 path
})

test('admin validation enforces the Studio dimension and weight limits', () => {
  const result = validateProductInput({
    ...activeProduct,
    dimensions: 'x'.repeat(200),
    weight: 'y'.repeat(100),
  })
  assert.equal(result.errors, undefined)
  assert.equal(result.product.dimensions.length, 120)
  assert.equal(result.product.weight.length, 40)
})
