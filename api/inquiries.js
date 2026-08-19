import { randomUUID } from 'node:crypto'
import { json, readJson } from './_lib/http.js'
import { sanityWriteClient } from './_lib/sanity.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d{8,15}$/
const ASSET_ID_RE = /^image-[a-zA-Z0-9]+-\d+x\d+-[a-z0-9]+$/

const string = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function validateInquiry(body) {
  const type = ['service', 'contact'].includes(body.type) ? body.type : 'contact'
  const name = string(body.name, 120)
  const contact = string(body.contact, 160)
  const message = string(body.message, 1500)
  const roomType = string(body.roomType, 60)
  const budgetRange = string(body.budgetRange, 60)
  const serviceName = string(body.serviceName, 160)
  const serviceSlug = string(body.serviceSlug, 96)
  const referenceImageAssetId = string(body.referenceImageAssetId, 200)
  const honeypot = string(body.company, 200)

  const errors = []
  if (honeypot) errors.push('Invalid submission.')
  if (!name) errors.push('Nama wajib diisi.')
  const normalizedContact = contact.replace(/[\s-]/g, '')
  if (!contact || !(EMAIL_RE.test(contact) || PHONE_RE.test(normalizedContact))) {
    errors.push('Kontak harus berupa email atau nomor telepon yang valid.')
  }
  if (type === 'service' && !serviceSlug) errors.push('Layanan tidak valid.')
  if (errors.length) return { errors }

  const inquiry = {
    _type: 'inquiry',
    type,
    name,
    contact,
    message,
    status: 'new',
    ...(roomType ? { roomType } : {}),
    ...(budgetRange ? { budgetRange } : {}),
    ...(serviceName ? { serviceName } : {}),
    ...(serviceSlug ? { serviceSlug } : {}),
    ...(referenceImageAssetId && ASSET_ID_RE.test(referenceImageAssetId)
      ? { referenceImage: { _type: 'image', asset: { _type: 'reference', _ref: referenceImageAssetId } } }
      : {}),
  }
  return { inquiry }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' })
  try {
    const body = await readJson(req)
    const { inquiry, errors } = validateInquiry(body)
    if (errors) return json(res, 400, { error: errors.join(' ') })

    const id = `inquiry-${Date.now()}-${randomUUID().slice(0, 8)}`
    await sanityWriteClient().create({ ...inquiry, _id: id })
    return json(res, 201, { id })
  } catch (error) {
    return json(res, 500, { error: error.message === 'Request body is too large.' ? error.message : 'Gagal mengirim permintaan.' })
  }
}
