import {createClient} from '@sanity/client'

/** @type {import('@sanity/client').ClientConfig} */
export const sanityConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'p3ihfsxq',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2025-02-19',
  // Fresh published content is preferred for an editor-facing marketing site.
  // Images still use Sanity's dedicated Image CDN.
  useCdn: false,
  perspective: 'published',
}

export const isSanityConfigured = Boolean(sanityConfig.projectId && sanityConfig.dataset)

export const sanityClient = isSanityConfigured ? createClient(sanityConfig) : null
