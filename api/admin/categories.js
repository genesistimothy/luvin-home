import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {sanityReadClient} from '../_lib/sanity.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'GET') return json(res, 405, {error: 'Method not allowed.'})
  try {
    const categories = await sanityReadClient().fetch(
      '*[_type == "collection" && !(_id in path("drafts.**"))] | order(displayOrder asc, name asc){_id,name,active}',
    )
    return json(res, 200, {categories})
  } catch {
    return json(res, 500, {error: 'Unable to load categories.'})
  }
}
