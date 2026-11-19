import {handleErpSync} from './_lib/erpSync.js'
import {json} from './_lib/http.js'
import {keepAlive, pruneSessionRevocations} from './_lib/supabase.js'

// This file serves two routes because the Hobby plan allows 12 functions and the
// project already uses all of them (vercel.json rewrites /api/erp-sync here):
//   GET  /api/keepalive  daily cron ping. The free Supabase project pauses after 7 idle days.
//   POST /api/erp-sync   ERP -> website product sync, see docs/erp-sync-contract.md.
export default async function handler(req, res) {
  if (req.method === 'POST') return handleErpSync(req, res)
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, {error: 'Method not allowed.'})
  try {
    await keepAlive()
    // Housekeeping only: an expired token is rejected anyway, so a failed prune never fails the ping.
    await pruneSessionRevocations().catch(() => {})
    return json(res, 200, {ok: true})
  } catch {
    return json(res, 500, {ok: false})
  }
}
