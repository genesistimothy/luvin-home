import sharp from 'sharp'

const WIDTHS = [480, 768, 1152, 1536, 1920]
const QUALITY = 90

/**
 * Convert one upload into high-quality WebP variants. Never enlarges.
 * Returns the source width too, so the largest variant matches the original.
 * @param {Buffer} buffer
 */
export async function makeImageVariants(buffer) {
  const metadata = await sharp(buffer).metadata()
  const sourceWidth = Number(metadata.width) || 0
  if (!sourceWidth) throw new Error('Image has no width.')

  const widths = WIDTHS.filter((width) => width <= sourceWidth)
  if (!widths.includes(sourceWidth)) widths.push(sourceWidth)

  return Promise.all(
    widths.sort((a, b) => a - b).map(async (width) => ({
      width,
      contentType: 'image/webp',
      buffer: await sharp(buffer)
        .resize({width, withoutEnlargement: true})
        .webp({quality: QUALITY, effort: 6})
        .toBuffer(),
    })),
  )
}
