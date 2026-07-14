import {createReadStream} from 'node:fs'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
import {fallbackContent} from '../../src/data/fallbackContent.js'

const client = getCliClient({apiVersion: '2025-02-19'})
const root = join(process.cwd(), '..')

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const idFor = (type, name) => `${type}-${slugify(name)}`
const priceNumber = (value) => typeof value === 'number' ? value : Number(String(value).replace(/[^0-9]/g, ''))

async function uploadImage(relativePath, filename) {
  return client.assets.upload('image', createReadStream(join(root, relativePath)), {filename})
}

function imageValue(asset, altText, caption) {
  return {
    _type: 'cmsImage',
    image: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
    altText,
    ...(caption ? {caption} : {}),
  }
}

async function migrate() {
  console.log('Uploading homepage and Inspired Spaces images...')
  const heroAsset = await uploadImage('public/hero-living-room.jpg', 'luvin-home-hero.jpg')
  const galleryAssets = await Promise.all(
    fallbackContent.inspiredSpaces.map((space, index) =>
      uploadImage(`public/images/gallery-${index + 1}.jpg`, `luvin-home-space-${index + 1}.jpg`),
    ),
  )

  const collectionDocs = fallbackContent.collections.map((collection, index) => ({
    _id: idFor('collection', collection.name),
    _type: 'collection',
    name: collection.name,
    slug: {_type: 'slug', current: slugify(collection.name)},
    summary: collection.summary,
    longDescription: collection.summary,
    featured: true,
    displayOrder: index + 1,
    active: false,
    seoTitle: `${collection.name} | Luvin Home`,
    seoDescription: collection.summary.slice(0, 165),
  }))

  const productDocs = fallbackContent.products.map((product, index) => ({
    _id: idFor('product', product.name),
    _type: 'product',
    name: product.name,
    slug: {_type: 'slug', current: slugify(product.name)},
    sku: `LUV-${String(index + 1).padStart(3, '0')}`,
    status: 'draft',
    featured: index < 3,
    displayOrder: index + 1,
    collection: {_type: 'reference', _ref: idFor('collection', product.category)},
    shortDescription: product.benefits?.[0],
    productStory: product.benefits?.[0],
    price: priceNumber(product.price),
    currency: 'IDR',
    colors: product.colors,
    dimensions: product.dimensions,
    weight: product.weight,
    materials: product.materials,
    benefits: product.benefits,
    stockStatus: 'inStock',
    madeToOrder: false,
    whatsAppMessage: `Hello Luvin Home, I would like to know more about the ${product.name}.`,
    seoTitle: `${product.name} | Luvin Home`,
    seoDescription: product.benefits?.[0]?.slice(0, 165),
  }))

  const inspiredDocs = fallbackContent.inspiredSpaces.map((space, index) => ({
    _id: `inspired-space-${index + 1}`,
    _type: 'inspiredSpace',
    title: space.title,
    slug: {_type: 'slug', current: `story-${index + 1}`},
    image: {_type: 'image', asset: {_type: 'reference', _ref: galleryAssets[index]._id}},
    altText: space.altText,
    caption: space.title,
    roomType: index < 3 ? 'Living Room' : index < 5 ? 'Dining Room' : 'Other',
    displayOrder: index + 1,
    active: true,
  }))

  const testimonialDocs = fallbackContent.testimonials.map((testimonial, index) => ({
    _id: `testimonial-${index + 1}`,
    _type: 'testimonial',
    quote: testimonial.quote,
    contentType: 'editorialPlaceholder',
    permissionConfirmed: false,
    displayOrder: index + 1,
    active: true,
  }))

  const faqCategories = ['Delivery', 'Assembly', 'Material', 'Delivery']
  const faqDocs = fallbackContent.faqs.map((faq, index) => ({
    _id: `faq-${index + 1}`,
    _type: 'faq',
    ...faq,
    category: faqCategories[index] || 'General',
    displayOrder: index + 1,
    active: true,
  }))

  const homepage = {
    _id: 'homepage',
    _type: 'homepage',
    ...fallbackContent.homepage,
    heroImage: imageValue(heroAsset, fallbackContent.homepage.heroImage.altText),
    featuredCollections: collectionDocs.map((doc, index) => ({_type: 'reference', _key: `collection-${index}`, _ref: doc._id})),
    featuredProducts: productDocs.slice(0, 3).map((doc, index) => ({_type: 'reference', _key: `product-${index}`, _ref: doc._id})),
  }

  const siteSettings = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    ...fallbackContent.siteSettings,
  }

  const documents = [
    ...collectionDocs,
    ...productDocs,
    ...inspiredDocs,
    ...testimonialDocs,
    ...faqDocs,
    homepage,
    siteSettings,
  ]

  console.log(`Writing ${documents.length} published documents...`)
  let transaction = client.transaction()
  for (const document of documents) transaction = transaction.createOrReplace(document)
  await transaction.commit({visibility: 'async'})
  console.log('Migration complete. Products and collections remain hidden until real product/cover images are uploaded and their status is activated.')
}

migrate().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
