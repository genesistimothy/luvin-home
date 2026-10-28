import {requireAdmin} from '../_lib/auth.js'
import {json} from '../_lib/http.js'
import {contentRows} from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return
  if (req.method !== 'GET') return json(res, 405, {error: 'Method not allowed.'})
  try {
    const rows = await contentRows()
    const products = rows.filter((row) => row.type === 'product')
    const recentProducts = products
      .slice()
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .slice(0, 5)
      .map((row) => ({
        _id: row.id,
        _updatedAt: row.updated_at,
        name: row.data.name,
        status: row.data.status,
        category: row.data.collection?.name || null,
      }))

    return json(res, 200, {
      totalProducts: products.length,
      activeProducts: products.filter((row) => row.status === 'published' && row.data.status === 'active').length,
      draftProducts: products.filter((row) => row.status === 'draft').length,
      totalCategories: rows.filter((row) => row.type === 'collection').length,
      recentProducts,
    })
  } catch {
    return json(res, 500, {error: 'Unable to load dashboard data.'})
  }
}
