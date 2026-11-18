import { json, readJson } from './_lib/http.js'
import { insertInquiry } from './_lib/supabase.js'
import { verifyTurnstile } from './_lib/turnstile.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d{8,15}$/
const IMAGE_PATH_RE = /^[a-zA-Z0-9._-]{1,200}$/

const string = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export function validateInquiry(body) {
  const type = ['service', 'contact'].includes(body.type) ? body.type : 'contact'
  const name = string(body.name, 120)
  const contact = string(body.contact, 160)
  const message = string(body.message, 1500)
  const roomType = string(body.roomType, 60)
  const budgetRange = string(body.budgetRange, 60)
  const serviceName = string(body.serviceName, 160)
  const serviceSlug = string(body.serviceSlug, 96)
  const referenceImagePath = string(body.referenceImagePath, 200)
  const honeypot = string(body.company, 200)

  const errors = []
  if (honeypot) errors.push('Invalid submission.')
  if (!name) errors.push('Name is required.')
  const normalizedContact = contact.replace(/[\s-]/g, '')
  if (!contact || !(EMAIL_RE.test(contact) || PHONE_RE.test(normalizedContact))) {
    errors.push('Contact must be a valid email or phone number.')
  }
  if (type === 'service' && !serviceSlug) errors.push('Invalid service.')
  if (referenceImagePath && !IMAGE_PATH_RE.test(referenceImagePath)) errors.push('Invalid reference image.')
  if (errors.length) return { errors }

  const inquiry = {
    type,
    name,
    contact,
    message,
    room_type: roomType || null,
    budget_range: budgetRange || null,
    service_name: serviceName || null,
    service_slug: serviceSlug || null,
    reference_image_path: referenceImagePath || null,
  }
  return { inquiry }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' })
  try {
    const body = await readJson(req)
    const turnstile = await verifyTurnstile(req, body.turnstileToken)
    if (!turnstile.ok) {
      return json(res, turnstile.status, {
        error: turnstile.status === 503 ? 'Verification is temporarily unavailable.' : 'Please complete the verification.',
      })
    }
    const { inquiry, errors } = validateInquiry(body)
    if (errors) return json(res, 400, { error: errors.join(' ') })

    await insertInquiry(inquiry)
    return json(res, 201, { ok: true })
  } catch {
    return json(res, 500, { error: 'Failed to send request.' })
  }
}
