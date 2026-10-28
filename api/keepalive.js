import {json} from './_lib/http.js'
import {keepAlive} from './_lib/supabase.js'

// The free Supabase project pauses after 7 idle days. Vercel runs this daily.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, {error: 'Method not allowed.'})
  try {
    await keepAlive()
    return json(res, 200, {ok: true})
  } catch {
    return json(res, 500, {ok: false})
  }
}
