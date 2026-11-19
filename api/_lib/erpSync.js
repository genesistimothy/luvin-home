import {json, readJson} from './http.js'
import {
  MAX_BODY_BYTES,
  deriveErpFields,
  draftIdFor,
  draftRowFor,
  draftSlugCandidates,
  isAuthorized,
  missingErpIds,
  sameErpState,
  validateErpPayload,
} from './erp.js'
import {
  contentErpProdukIds,
  contentRow,
  contentRowByErpId,
  insertContentRowIfAbsent,
  patchContentRowIfUnchanged,
} from './supabase.js'

const supabaseStore = {
  getRow: contentRow,
  findByErpId: contentRowByErpId,
  listErpProdukIds: contentErpProdukIds,
  insertIfAbsent: insertContentRowIfAbsent,
  updateIfUnchanged: patchContentRowIfUnchanged,
}

const UPDATE_ATTEMPTS = 3

/**
 * Apply one ERP product. Returns 'created' | 'updated' | 'unchanged' | 'failed'.
 * - unchanged: the row already matches, nothing was written
 * - failed: the product cannot be applied (bad mapping or a conflict); nothing was written
 * Only ERP-owned fields are written; rows are never deleted. A database error
 * throws instead, so the caller can answer 500 (the ERP retries; every step is idempotent).
 */
async function syncOne(product, store, now) {
  const derived = deriveErpFields(product, now())
  let row

  if (product.websiteProductId) {
    row = await store.getRow(product.websiteProductId)
    if (!row || row.type !== 'product') return 'failed'
    const owner = row.data?.erp?.produkId
    if (owner && owner !== product.erpProdukId) return 'failed'
    if (!owner) {
      // First time this row is mapped: refuse if the ERP product already belongs to another row.
      const claimed = await store.findByErpId(product.erpProdukId)
      if (claimed && claimed.id !== row.id) return 'failed'
    }
  } else {
    row = await store.findByErpId(product.erpProdukId)
  }

  if (!row) return createDraft(product, derived, store)

  for (let attempt = 0; attempt < UPDATE_ATTEMPTS; attempt += 1) {
    if (sameErpState(row.data, derived)) return 'unchanged'
    const applied = await store.updateIfUnchanged(row.id, row.updated_at, {data: {...row.data, ...derived}})
    if (applied) return 'updated'
    row = await store.getRow(row.id)
    if (!row) return 'failed'
  }
  throw new Error('Row kept changing during sync.')
}

async function createDraft(product, derived, store) {
  for (const slug of draftSlugCandidates(product.name, product.erpProdukId)) {
    try {
      if (await store.insertIfAbsent(draftRowFor(product, derived, slug))) return 'created'
      // The id was taken. If the row now carries this ERP id, a concurrent request just created it.
      const existing = await store.findByErpId(product.erpProdukId)
      return existing && existing.id === draftIdFor(product.erpProdukId) ? 'unchanged' : 'failed'
    } catch (error) {
      if (error?.status !== 409) throw error
      // The slug is taken by another product: try the next candidate.
    }
  }
  return 'failed'
}

/**
 * POST /api/erp-sync. Server-to-server: no browser session, no CORS.
 * Contract: docs/erp-sync-contract.md
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
  const {mode, products} = result.payload

  const counts = {updated: 0, created: 0, unchanged: 0, failed: 0}
  const failedErpProdukIds = []
  // The failing ids are listed only when something failed, so a clean 200 is just counts.
  const failures = () => (failedErpProdukIds.length ? {failedErpProdukIds} : {})
  try {
    for (const product of products) {
      const outcome = await syncOne(product, store, now)
      counts[outcome] += 1
      if (outcome === 'failed') failedErpProdukIds.push(product.erpProdukId)
    }
  } catch {
    // Every step is idempotent, so the ERP can safely send the same request again.
    return json(res, 500, {error: 'Sync failed. Safe to retry.', ...counts, ...failures()})
  }

  // Full catalogue: report mapped products the ERP did not send. Reported only, never changed or deleted.
  let missing = {}
  if (mode === 'full') {
    try {
      const ids = missingErpIds(await store.listErpProdukIds(), products.map((product) => product.erpProdukId))
      missing = {missing: ids.length, missingErpProdukIds: ids}
    } catch {
      return json(res, 500, {error: 'Sync failed. Safe to retry.', ...counts, ...failures()})
    }
  }

  const summary = {mode, received: products.length, ...counts, ...failures(), ...missing}
  if (counts.failed > 0) return json(res, 422, {ok: false, error: 'Some products could not be applied.', ...summary})
  return json(res, 200, {ok: true, ...summary})
}
