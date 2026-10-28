const env = process.env
const errors = []

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_CONTENT_SOURCE',
  'ADMIN_SESSION_SECRET',
  'ADMIN_ALLOWED_EMAILS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'TURNSTILE_SECRET_KEY',
  'VITE_TURNSTILE_SITE_KEY',
]

for (const key of required) {
  if (!env[key]) errors.push(`missing ${key}`)
}

if (env.VITE_CONTENT_SOURCE && env.VITE_CONTENT_SOURCE !== 'supabase') {
  errors.push('VITE_CONTENT_SOURCE must be supabase')
}

const isLocal = (value) => /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(value)
for (const key of ['SUPABASE_URL', 'VITE_SUPABASE_URL']) {
  const value = env[key]
  if (value && (!value.startsWith('https://') || isLocal(value))) {
    errors.push(`${key} must be an https cloud URL, not ${value}`)
  }
}

if (env.SUPABASE_URL && env.VITE_SUPABASE_URL) {
  try {
    if (new URL(env.SUPABASE_URL).host !== new URL(env.VITE_SUPABASE_URL).host) {
      errors.push('SUPABASE_URL and VITE_SUPABASE_URL point to different projects')
    }
  } catch {
    errors.push('SUPABASE_URL or VITE_SUPABASE_URL is not a valid URL')
  }
}

if (env.ADMIN_SESSION_SECRET && env.ADMIN_SESSION_SECRET.length < 32) {
  errors.push('ADMIN_SESSION_SECRET must be at least 32 characters')
}

if (!env.ADMIN_ALLOWED_EMAILS?.includes('@')) {
  errors.push('ADMIN_ALLOWED_EMAILS must contain an email address')
}

if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY === env.VITE_SUPABASE_ANON_KEY) {
  errors.push('the service role key is exposed as VITE_SUPABASE_ANON_KEY')
}

for (const [key, value] of Object.entries(env)) {
  if (key.startsWith('VITE_') && value && value === env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push(`${key} contains the service role key`)
  }
}

if (errors.length) {
  console.error('Preflight failed before any network call:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const base = env.SUPABASE_URL.replace(/\/$/, '')
const headers = (key) => ({apikey: key, Authorization: `Bearer ${key}`})
const service = headers(env.SUPABASE_SERVICE_ROLE_KEY)
const anon = headers(env.VITE_SUPABASE_ANON_KEY)

const check = async (label, fn) => {
  try {
    await fn()
    console.log(`ok: ${label}`)
  } catch (error) {
    errors.push(`${label}: ${error.message}`)
  }
}

await check('public content is readable', async () => {
  const response = await fetch(`${base}/rest/v1/content?select=id,type,data&order=display_order.asc`, {headers: anon})
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const rows = await response.json()
  if (rows.length < 19) throw new Error(`only ${rows.length} rows, expected at least 19. Run npm run cms:seed:cloud`)
  const product = rows.find((row) => row.type === 'product' && row.data?.mainImage?.variants?.length)
  if (!product) throw new Error('no product has image variants. Run npm run cms:seed:cloud')
  console.log(`    ${rows.length} content rows, image variants present`)
})

await check('inquiries are private', async () => {
  const response = await fetch(`${base}/rest/v1/inquiries?select=id`, {headers: anon})
  if (response.status !== 401 && response.status !== 403) throw new Error(`anon read returned ${response.status}`)
})

await check('service role reads inquiries', async () => {
  const response = await fetch(`${base}/rest/v1/inquiries?select=id`, {headers: service})
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
})

await check('storage buckets exist with the right visibility', async () => {
  const response = await fetch(`${base}/storage/v1/bucket`, {headers: service})
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buckets = await response.json()
  const content = buckets.find((bucket) => bucket.id === 'content')
  const inquiries = buckets.find((bucket) => bucket.id === 'inquiries')
  if (!content?.public) throw new Error('content bucket is missing or not public')
  if (!inquiries || inquiries.public) throw new Error('inquiries bucket is missing or public')
})

if (errors.length) {
  console.error('Preflight failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Preflight passed. The seed is present and the security boundaries are correct.')
