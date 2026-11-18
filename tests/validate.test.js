import test from 'node:test'
import assert from 'node:assert/strict'
import {isValidContact, isValidEmail, isValidPhone} from '../src/lib/validate.js'

test('isValidPhone accepts national and international formats', () => {
  for (const value of [
    '081234567890',
    '+62 812-3456-7890',
    '(021) 555-1234',
    '+1 (415) 555 2671',
    '0812.3456.7890',
    '  +44 20 7946 0958  ',
  ]) {
    assert.equal(isValidPhone(value), true, value)
  }
})

test('isValidPhone rejects empty values and junk', () => {
  for (const value of ['', '   ', '12345', 'abcdefgh', '+', '0812-ABCD', '----------']) {
    assert.equal(isValidPhone(value), false, value)
  }
})

test('isValidContact accepts an email or a phone number', () => {
  assert.equal(isValidContact('name@example.com'), true)
  assert.equal(isValidContact('+62 812-3456-7890'), true)
  assert.equal(isValidContact('not-a-contact'), false)
  assert.equal(isValidEmail('  name@example.com  '), true)
})
