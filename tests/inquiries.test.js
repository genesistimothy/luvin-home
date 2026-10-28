import test from 'node:test'
import assert from 'node:assert/strict'
import {validateInquiry} from '../api/inquiries.js'

const valid = {type: 'contact', name: 'Ayu', contact: 'ayu@example.com', message: 'Hello'}

test('a contact inquiry maps to the inquiries row shape', () => {
  const {inquiry, errors} = validateInquiry(valid)
  assert.equal(errors, undefined)
  assert.deepEqual(inquiry, {
    type: 'contact',
    name: 'Ayu',
    contact: 'ayu@example.com',
    message: 'Hello',
    room_type: null,
    budget_range: null,
    service_name: null,
    service_slug: null,
    reference_image_path: null,
  })
})

test('a service inquiry requires a slug', () => {
  assert.deepEqual(validateInquiry({...valid, type: 'service'}).errors, ['Invalid service.'])
  assert.equal(validateInquiry({...valid, type: 'service', serviceSlug: 'design'}).errors, undefined)
})

test('the honeypot rejects a submission', () => {
  assert.equal(validateInquiry({...valid, company: 'bot'}).errors[0], 'Invalid submission.')
})

test('contact must be an email or a phone number', () => {
  assert.equal(validateInquiry({...valid, contact: 'nope'}).errors[0], 'Contact must be a valid email or phone number.')
  assert.equal(validateInquiry({...valid, contact: '+62 812-3456-7890'}).errors, undefined)
})

test('a reference image path must be one the upload endpoint could return', () => {
  assert.equal(validateInquiry({...valid, referenceImagePath: '../etc/passwd'}).errors[0], 'Invalid reference image.')
  assert.equal(
    validateInquiry({...valid, referenceImagePath: '0b7c1f7e-9a1c-4d47-8f52-2a8f1a3c9d10-photo.jpg'}).errors,
    undefined,
  )
})

test('text fields are trimmed and capped', () => {
  const {inquiry} = validateInquiry({...valid, name: `  ${'a'.repeat(200)}  `})
  assert.equal(inquiry.name.length, 120)
})
