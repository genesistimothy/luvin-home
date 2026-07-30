export const cmsContentQuery = `{
  "homepage": *[_id == "homepage"][0]{
    heroEyebrow, heroTitle, heroDescription,
    heroImage{altText, caption, image{asset->{_id, url}, crop, hotspot}},
    heroPrimaryCtaLabel, heroPrimaryCtaTarget, heroSecondaryCtaLabel, heroSecondaryCtaTarget,
    brandStoryEyebrow, brandStoryTitle, brandStoryParagraphs,
    philosophyEyebrow, philosophyTitle, philosophyDescription,
    faqEyebrow, faqTitle,
    intelligenceEyebrow, intelligenceTitle, intelligenceDescription, intelligenceCtaLabel,
    contactEyebrow, contactTitle, contactDescription, contactPrimaryCtaLabel, contactSecondaryCtaLabel
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
    _id, name, "slug": slug.current, sku, status, featured, displayOrder,
    "category": collection->name, shortDescription, productStory, price, compareAtPrice, currency,
    mainImage{altText, caption, image{asset->{_id, url}, crop, hotspot}},
    colors, dimensions, weight, materials, benefits, stockStatus, madeToOrder, leadTime, whatsAppMessage
  },
  "faqs": *[_type == "faq" && active == true] | order(displayOrder asc){
    _id, question, answer, category
  }
}`
