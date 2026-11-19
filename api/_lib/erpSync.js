import {json, readJson} from './http.js'
import {
  MAX_BODY_BYTES,
  deriveErpFields,
  draftRowFor,
  draftSlugCandidates,
  isAuthorized,
  sameErpState,
  validateErpPayload,
} from './erp.js'
import {contentRow, contentRowByErpId, insertContentRowIfAbsent, patchContentRowIfUnchanged} from './supabase.js'

const supabaseStore = {
  getRow: contentRow,
  findByErpId: contentRowByErpId,
  insertIfAbsent: insertContentRowIfAbsent,
  updateIfUnchanged: patchContentRowIfUnchanged,
}

const UPDATE_ATTEMPTS = 3

/**
 * Apply one ERP product. Returns 'created' | 'updated' | 'skipped'.
 * Only ERP-owned fields are written; rows are never deleted.
 */
async function syncOne(product, store, now) {
  const derived = deriveErpFields(product, now())
  let row

  if (product.websiteProductId) {
    row = await store.getRow(product.websiteProductId)
    if (!row || row.type !== 'product') return 'skipped'
    const owner = row.data?.erp?.produkId
    if (owner && owner !== product.erpProdukId) return 'skipped'
    if (!owner) {
      // First time this row is mapped: refuse if the ERP product already belongs to another row.
      const claimed = await store.findByErpId(product.erpProdukId)
      if (claimed && claimed.id !== row.id) return 'skipped'
    }
  } else {
    row = await store.findByErpId(product.erpProdukId)
  }

  if (!row) return createDraft(product, derived, store)

  for (let attempt = 0; attempt < UPDATE_ATTEMPTS; attempt += 1) {
    if (sameErpState(row.data, derived)) return 'skipped'
    const applied = await store.updateIfUnchanged(row.id, row.updated_at, {data: {...row.data, ...derived}})
    if (applied) return 'updated'
    row = await store.getRow(row.id)
    if (!row) return 'skipped'
  }
  throw new Error('Row kept changing during sync.')
}

async function createDraft(product, derived, store) {
  for (const slug of draftSlugCandidates(product.name, product.erpProdukId)) {
    try {
      return (await store.insertIfAbsent(draftRowFor(product, derived, slug))) ? 'created' : 'skipped'
    } catch (error) {
      if (error?.status !== 409) throw error
      // The slug is taken by another product: try the next candidate.
    }
  }
  return 'skipped'
}

/**
 * POST /api/erp-sync. Server-to-server: no browser session, no CORS.
 * @param {any} req
 * @param {any} res
 * @param {{secret?: string, store?: typeof supabaseStore, now?: () => string}} [deps]
 */
export async function handleErpSync(req, res, deps = {}) {
  const secret = 'secret' in deps ? deps.secret : process.env.ERP_SYNC_SECRET
  const store = deps.store || supabaseStore
  const now = deps.now || (() => new Date().toISOString())

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, {error: 'Method not allowed.'})
  }
  // Fail closed: without a configured secret nobody can sync.
  if (!secret) return json(res, 503, {error: 'ERP sync is not configured.'})
  if (!isAuthorized(req.headers?.authorization, secret)) {
    res.setHeader('WWW-Authenticate', 'Bearer')
    return json(res, 401, {error: 'Unauthorized.'})
  }

  let body
  try {
    body = await readJson(req, MAX_BODY_BYTES)
  } catch (error) {
    if (error?.message === 'Request body is too large.') return json(res, 413, {error: error.message})
    return json(res, 400, {error: 'Body must be valid JSON.'})
  }

  const result = validateErpPayload(body)
  if ('errors' in result) return json(res, 400, {error: 'Invalid payload.', details: result.errors})

  const counts = {updated: 0, created: 0, skipped: 0}
  try {
    for (const product of result.payload.products) counts[await syncOne(product, store, now)] += 1
  } catch {
    // Every step is idempotent, so the ERP can safely send the same request again.
    return json(res, 500, {error: 'Sync failed. Safe to retry.', ...counts})
  }
  return json(res, 200, {ok: true, mode: result.payload.mode, received: result.payload.products.length, ...counts})
}
