import {useEffect, useState} from 'react'
import {fallbackContent} from '../data/fallbackContent'
import {sanityClient} from '../lib/sanityClient'
import {sanityImageUrl} from '../lib/sanityImage'
import {cmsContentQuery} from '../lib/queries'

const populated = (value) => Array.isArray(value) && value.length > 0

function normalizeCms(data) {
  const homepage = {...fallbackContent.homepage, ...(data.homepage || {})}
  if (data.homepage?.heroImage?.image) {
    homepage.heroImage = {
      ...data.homepage.heroImage,
      url: sanityImageUrl(data.homepage.heroImage, {width: 1920, quality: 88}),
    }
  }

  const siteSettings = {...fallbackContent.siteSettings, ...(data.siteSettings || {})}
  if (data.siteSettings?.openGraphImage?.image) {
    siteSettings.openGraphImageUrl = sanityImageUrl(data.siteSettings.openGraphImage, {width: 1200, height: 630, quality: 88})
  }

  return {
    ...fallbackContent,
    homepage,
    siteSettings,
    collections: populated(data.collections) ? data.collections : fallbackContent.collections,
    products: populated(data.products)
      ? data.products.map((product) => ({
          ...product,
          mainImageUrl: sanityImageUrl(product.mainImage, {width: 900}),
        }))
      : fallbackContent.products,
    inspiredSpaces: populated(data.inspiredSpaces)
      ? data.inspiredSpaces.map((space) => ({...space, url: sanityImageUrl(space.image, {width: 1200})}))
      : fallbackContent.inspiredSpaces,
    testimonials: populated(data.testimonials) ? data.testimonials : fallbackContent.testimonials,
    faqs: populated(data.faqs) ? data.faqs : fallbackContent.faqs,
  }
}

export function useCmsContent() {
  const [content, setContent] = useState(fallbackContent)

  useEffect(() => {
    if (!sanityClient) return undefined
    const controller = new AbortController()

    sanityClient
      .fetch(cmsContentQuery, {}, {signal: controller.signal})
      .then((data) => setContent(normalizeCms(data || {})))
      .catch((error) => {
        if (error?.name !== 'AbortError' && import.meta.env.DEV) {
          console.info('Sanity content unavailable; using local fallback.')
        }
      })

    return () => controller.abort()
  }, [])

  return content
}

export function useHomepageSeo(siteSettings) {
  useEffect(() => {
    if (!siteSettings) return
    if (siteSettings.seoDefaultTitle) document.title = siteSettings.seoDefaultTitle

    const description = document.querySelector('meta[name="description"]')
    if (description && siteSettings.seoDefaultDescription) {
      description.setAttribute('content', siteSettings.seoDefaultDescription)
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogTitle && siteSettings.seoDefaultTitle) ogTitle.setAttribute('content', siteSettings.seoDefaultTitle)
    if (ogDescription && siteSettings.seoDefaultDescription) ogDescription.setAttribute('content', siteSettings.seoDefaultDescription)
    if (ogImage && siteSettings.openGraphImageUrl) ogImage.setAttribute('content', siteSettings.openGraphImageUrl)
  }, [siteSettings])
}
