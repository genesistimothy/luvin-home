import {createClient} from '@sanity/client'

const config = () => ({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'p3ihfsxq',
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || '2025-02-19',
  useCdn: false,
})

export function sanityReadClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  return createClient({...config(), token, perspective: token ? 'raw' : 'published'})
}

export function sanityWriteClient() {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!token) throw new Error('SANITY_WRITE_TOKEN is not configured.')
  return createClient({...config(), token, perspective: 'raw'})
}
