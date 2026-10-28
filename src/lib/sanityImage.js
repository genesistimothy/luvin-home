import {createImageUrlBuilder} from '@sanity/image-url'
import {sanityClient} from './sanityClient'

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null

/**
 * @param {any} source
 * @param {{width?: number, height?: number, quality?: number}} options
 */
export function sanityImageUrl(source, {width, height, quality = 82} = {}) {
  if (!source) return ''
  if (typeof source === 'string') return source
  if (source.variants?.length) {
    const target = Number(width) || source.variants[source.variants.length - 1].width
    const best = source.variants.reduce((current, variant) =>
      Math.abs(variant.width - target) < Math.abs(current.width - target) ? variant : current,
    )
    return best.url
  }
  const imageSource = source.image || source.asset || source
  const hasImage = Boolean(source.image || source.asset)
  if (!hasImage && source.url) return source.url
  if (!builder) return source.url || ''

  let image = builder.image(imageSource).auto('format').quality(quality)
  if (width) image = image.width(width)
  if (height) image = image.height(height).fit('crop')
  return image.url()
}

/**
 * Responsive srcset for a Sanity image source. Returns an empty string when
 * the source has no image object (e.g. a plain URL).
 * @param {any} source
 * @param {number[]} widths
 * @param {{height?: number, quality?: number}} [options]
 */
export function sanityImageSrcSet(source, widths, options = {}) {
  if (!source || typeof source === 'string') return ''
  if (source.variants?.length) {
    return source.variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ')
  }
  if (!source.image && !source.asset) {
    // Supabase-backed content stores a plain URL. Declare the same file at each
    // width so a hardcoded fallback srcset does not win over the CMS image.
    return source.url ? widths.map((width) => `${source.url} ${width}w`).join(', ') : ''
  }
  return widths
    .map((width) => `${sanityImageUrl(source, {...options, width})} ${width}w`)
    .filter((entry) => !entry.startsWith(' '))
    .join(', ')
}
