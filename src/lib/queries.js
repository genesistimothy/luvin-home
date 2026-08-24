export const cmsContentQuery = `{
  "homepage": *[_id == "homepage"][0]{
    heroEyebrow, heroTitle, heroDescription,
    heroImage{altText, caption, image{asset->{_id, url}, crop, hotspot}},
    heroPrimaryCtaLabel, heroPrimaryCtaTarget, heroSecondaryCtaLabel, heroSecondaryCtaTarget,
    faqEyebrow, faqTitle,
    intelligenceEyebrow, intelligenceTitle, intelligenceDescription, intelligenceCtaLabel
  },
  "siteSettings": *[_id == "siteSettings"][0]{
    brandName, brandPromise, whatsAppNumber, defaultWhatsAppMessage,
    instagramUrl, instagramUsername, email, businessAddress, operatingHours, deliveryArea,
    footerText, seoDefaultTitle, seoDefaultDescription,
    openGraphImage{altText, image{asset->{_id, url}, crop, hotspot}}
  },
  "collections": *[_type == "collection" && active == true] | order(displayOrder asc){
    _id, name, "slug": slug.current, summary, featured, displayOrder,
    coverImage{altText, image{asset->{_id, url}, crop, hotspot}}
  },
  "products": *[_type == "product" && status in ["active", "soldOut", "comingSoon"]] | order(displayOrder asc){
    _id, _createdAt, name, "slug": slug.current, sku, status, featured, displayOrder,
    "category": collection->name,
    "collection": collection->{name, "slug": slug.current},
    shortDescription, productStory, price, compareAtPrice, currency,
    mainImage{altText, caption, image{asset->{_id, url}, crop, hotspot}},
    galleryImages[]{altText, caption, image{asset->{_id, url}, crop, hotspot}},
    colors, dimensions, weight, materials, benefits, specifications,
    stockStatus, madeToOrder, leadTime, assemblyInformation, warranty, deliveryNotes,
    whatsAppMessage, seoTitle, seoDescription
  },
  "faqs": *[_type == "faq" && active == true] | order(displayOrder asc){
    _id, question, answer, category
  }
}`

const cmsImageFields = `altText, caption, image{asset->{_id, url}, crop, hotspot}`

export const servicesQuery = `*[_type == "service" && active == true] | order(displayOrder asc){
  _id, name, "slug": slug.current, summary, displayOrder,
  heroImage{${cmsImageFields}}
}`

export const serviceBySlugQuery = `*[_type == "service" && slug.current == $slug && active == true][0]{
  _id, name, "slug": slug.current, summary, processSteps, seoTitle, seoDescription,
  heroImage{${cmsImageFields}}
}`

export const projectsQuery = `*[_type == "project" && active == true] | order(displayOrder asc){
  _id, title, "slug": slug.current, roomType, summary,
  coverImage{${cmsImageFields}}
}`

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug && active == true][0]{
  _id, title, "slug": slug.current, roomType, summary, seoTitle, seoDescription,
  coverImage{${cmsImageFields}},
  beforeImage{${cmsImageFields}},
  afterImage{${cmsImageFields}},
  gallery[]{${cmsImageFields}},
  relatedProducts[]->{
    _id, name, "slug": slug.current, status, stockStatus, price, compareAtPrice, currency,
    dimensions, "category": collection->name,
    mainImage{${cmsImageFields}}
  }
}`

export const articlesQuery = `*[_type == "article" && status == "published"] | order(publishedAt desc){
  _id, title, "slug": slug.current, excerpt, publishedAt, author,
  coverImage{${cmsImageFields}}
}`

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug && status == "published"][0]{
  _id, title, "slug": slug.current, excerpt, publishedAt, author, body, seoTitle, seoDescription,
  coverImage{${cmsImageFields}}
}`
