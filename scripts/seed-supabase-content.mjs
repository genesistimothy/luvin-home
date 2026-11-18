import {cmsContentQuery} from '../src/lib/queries.js'
import {serviceLinks} from '../src/data/services.js'
import {uploadPublicImage} from '../api/_lib/contentImages.js'

const SANITY_PROJECT = process.env.SANITY_PROJECT_ID || 'p3ihfsxq'
const SANITY_DATASET = process.env.SANITY_DATASET || 'production'
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const headers = {apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`}

const uploadImage = async (asset) => {
  const image = await fetch(asset.url)
  if (!image.ok) throw new Error(`Image fetch failed with ${image.status}.`)
  const buffer = Buffer.from(await image.arrayBuffer())
  const filename = new URL(asset.url).pathname.split('/').pop()
  return uploadPublicImage(buffer, filename, asset._id)
}

// Sanity image objects become {url, variants, altText, caption}. The storefront
// picks the nearest variant through sanityImageUrl() and sanityImageSrcSet().
const replaceImages = async (value) => {
  if (Array.isArray(value)) return Promise.all(value.map(replaceImages))
  if (!value || typeof value !== 'object') return value

  const asset = value.image?.asset
  if (asset?.url && asset?._id) {
    const uploaded = await uploadImage(asset)
    return {
      url: uploaded.url,
      variants: uploaded.variants,
      ...(value.altText ? {altText: value.altText} : {}),
      ...(value.caption ? {caption: value.caption} : {}),
    }
  }

  const entries = await Promise.all(
    Object.entries(value).map(async ([key, entry]) => [key, await replaceImages(entry)]),
  )
  return Object.fromEntries(entries)
}

const query = `https://${SANITY_PROJECT}.api.sanity.io/v2025-02-19/data/query/${SANITY_DATASET}?query=${encodeURIComponent(cmsContentQuery)}`
const response = await fetch(query)
if (!response.ok) throw new Error(`Sanity query failed with ${response.status}.`)
const {result} = await response.json()

const data = await replaceImages(result)
const rows = [
  {id: 'homepage', type: 'homepage', slug: null, display_order: 0, data: data.homepage},
  {id: 'siteSettings', type: 'siteSettings', slug: null, display_order: 0, data: data.siteSettings},
  ...(data.collections || []).map((item, index) => ({
    id: item._id,
    type: 'collection',
    slug: item.slug,
    display_order: item.displayOrder ?? index,
    data: item,
  })),
  ...(data.products || []).map((item, index) => ({
    id: item._id,
    type: 'product',
    slug: item.slug,
    display_order: item.displayOrder ?? index,
    data: item,
  })),
  ...(data.faqs || []).map((item, index) => ({
    id: item._id,
    type: 'faq',
    slug: null,
    display_order: index,
    data: item,
  })),
  ...serviceLinks.map((service, index) => ({
    id: `service-${service.slug}`,
    type: 'service',
    slug: service.slug,
    display_order: index,
    data: {...service, active: true},
  })),
].map((row) => ({...row, status: 'published'}))

const write = await fetch(`${SUPABASE_URL}/rest/v1/content?on_conflict=id`, {
  method: 'POST',
  headers: {
    ...headers,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify(rows),
})
if (!write.ok) throw new Error(`Content upsert failed with ${write.status}: ${await write.text()}`)

console.log(`seeded ${rows.length} content rows`)
for (const type of ['homepage', 'siteSettings', 'collection', 'product', 'faq', 'service']) {
  console.log(`${type}: ${rows.filter((row) => row.type === type).length}`)
}
