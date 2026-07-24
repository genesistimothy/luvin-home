import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {sanityReadClient} from '../_lib/sanity.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'GET') return json(res, 405, {error: 'Method not allowed.'})
  try {
    const data = await sanityReadClient().fetch(`{
      "totalProducts": count(*[_type == "product" && !(_id in path("drafts.**"))]),
      "activeProducts": count(*[_type == "product" && !(_id in path("drafts.**")) && status == "active"]),
      "draftProducts": count(*[_type == "product" && _id in path("drafts.**")]),
      "totalCategories": count(*[_type == "collection" && !(_id in path("drafts.**"))]),
      "recentProducts": *[_type == "product"] | order(_updatedAt desc)[0...5]{
        _id, _updatedAt, name, status, "category": collection->name
      }
    }`)
    return json(res, 200, data)
  } catch {
    return json(res, 500, {error: 'Unable to load dashboard data.'})
  }
}
