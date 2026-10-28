import { randomUUID } from 'node:crypto'

const BUCKET = 'inquiries'

const config = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase is not configured.')
  return { url: url.replace(/\/$/, ''), key }
}

const request = async (path, options = {}) => {
  const { url, key } = config()
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...options.headers },
  })
  if (!response.ok) {
    const error = /** @type {Error & {status?: number}} */ (new Error(`Supabase request failed with ${response.status}.`))
    error.status = response.status
    throw error
  }
  return response
}

/** @param {{type?: string, status?: string}} [options] */
export async function contentRows({type, status} = {}) {
  const params = new URLSearchParams({select: '*', order: 'display_order.asc'})
  if (type) params.set('type', `eq.${type}`)
  if (status) params.set('status', `eq.${status}`)
  const response = await request(`/rest/v1/content?${params}`)
  return response.json()
}

export async function contentRow(id) {
  const response = await request(`/rest/v1/content?select=*&id=eq.${encodeURIComponent(id)}`)
  const rows = await response.json()
  return rows[0] || null
}

export async function saveContentRow(row) {
  await request('/rest/v1/content?on_conflict=id', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal'},
    body: JSON.stringify([row]),
  })
}

export async function patchContentRow(id, patch) {
  await request(`/rest/v1/content?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json', Prefer: 'return=minimal'},
    body: JSON.stringify({...patch, updated_at: new Date().toISOString()}),
  })
}



export async function insertInquiry(row) {
  await request('/rest/v1/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  })
}

export async function uploadReferenceImage(buffer, contentType, filename) {
  const path = `${randomUUID()}-${filename}`
  await request(`/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType, 'x-upsert': 'false' },
    body: buffer,
  })
  return path
}

export async function keepAlive() {
  await request('/rest/v1/inquiries?select=id&limit=1')
}
