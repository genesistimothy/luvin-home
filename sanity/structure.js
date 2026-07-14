const singleton = (S, title, schemaType, documentId) =>
  S.listItem()
    .title(title)
    .id(documentId)
    .child(S.document().schemaType(schemaType).documentId(documentId).title(title))

export const structure = (S) =>
  S.list()
    .title('LUVIN HOME Content')
    .items([
      singleton(S, 'Homepage', 'homepage', 'homepage'),
      S.documentTypeListItem('product').title('Products'),
      S.documentTypeListItem('collection').title('Collections'),
      S.documentTypeListItem('inspiredSpace').title('Inspired Spaces'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.documentTypeListItem('faq').title('FAQ'),
      S.divider(),
      singleton(S, 'Site Settings', 'siteSettings', 'siteSettings'),
    ])
