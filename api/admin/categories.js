import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {contentRows} from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return
  if (req.method !== 'GET') return json(res, 405, {error: 'Method not allowed.'})
  try {
    const rows = await contentRows({type: 'collection', status: 'published'})
    const categories = rows
      .map((row) => ({_id: row.id, name: row.data.name, slug: row.data.slug, active: true}))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    return json(res, 200, {categories})
  } catch {
    return json(res, 500, {error: 'Unable to load categories.'})
  }
}
