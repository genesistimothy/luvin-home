const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const headers = { apikey: key, Authorization: `Bearer ${key}` }

export const supabaseContentEnabled =
  import.meta.env.VITE_CONTENT_SOURCE === 'supabase' && Boolean(url && key)

/**
 * Public content is readable with the anon key. RLS returns published rows only.
 * @param {{signal?: AbortSignal}} [options]
 */
export async function fetchSupabaseContent({signal} = {}) {
  const response = await fetch(
    `${url}/rest/v1/content?select=*&status=eq.published&order=display_order.asc`,
    {headers, signal},
  )
  if (!response.ok) throw new Error(`Content request failed with ${response.status}.`)

  const rows = await response.json()
  const one = (type) => {
    const row = rows.find((entry) => entry.type === type)
    return row ? {_id: row.id, ...row.data} : null
  }
  const many = (type) =>
    rows
      .filter((row) => row.type === type)
      .map((row) => ({_id: row.id, ...row.data}))

  return {
    homepage: one('homepage'),
    siteSettings: one('siteSettings'),
    collections: many('collection'),
    products: many('product'),
    faqs: many('faq'),
  }
}

/**
 * Rows for services, projects, and articles. A slug returns at most one row.
 * @param {{type?: string, slug?: string, signal?: AbortSignal}} options
 */
export async function fetchContentRows({ type, slug, signal } = {}) {
  if (!type) throw new Error('Content type is required.')
  const params = new URLSearchParams({
    select: '*',
    type: `eq.${type}`,
    status: 'eq.published',
    order: 'display_order.asc',
  })
  if (slug) params.set('slug', `eq.${slug}`)

  const response = await fetch(`${url}/rest/v1/content?${params}`, { headers, signal })
  if (!response.ok) throw new Error(`Content request failed with ${response.status}.`)

  const rows = await response.json()
  return rows.map((row) => ({ _id: row.id, ...row.data }))
}
