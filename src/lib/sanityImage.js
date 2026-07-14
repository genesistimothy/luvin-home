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
  if (source.url) return source.url
  if (!builder) return ''

  const imageSource = source.image || source
  let image = builder.image(imageSource).auto('format').quality(quality)
  if (width) image = image.width(width)
  if (height) image = image.height(height).fit('crop')
  return image.url()
}
