import {defineArrayMember, defineField, defineType} from 'sanity'

const statusOptions = [
  ['draft', 'Draft'], ['active', 'Active'], ['soldOut', 'Sold out'],
  ['comingSoon', 'Coming soon'], ['archived', 'Archived'],
].map(([value, title]) => ({title, value}))

const stockOptions = [
  ['inStock', 'In stock'], ['lowStock', 'Low stock'], ['preOrder', 'Pre-order'],
  ['madeToOrder', 'Made to order'], ['soldOut', 'Sold out'],
].map(([value, title]) => ({title, value}))

const requiredWhenActive = (value, context, message) =>
  context.document?.status !== 'active' || value ? true : message

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'story', title: 'Story & details'},
    {name: 'commerce', title: 'Price & availability'},
    {name: 'media', title: 'Images'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', group: 'identity', validation: (Rule) => Rule.required().max(120)}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'identity', options: {source: 'name', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'sku', title: 'SKU', type: 'string', group: 'identity', validation: (Rule) => Rule.custom((value, context) => requiredWhenActive(value, context, 'SKU is required for active products.'))}),
    defineField({name: 'status', title: 'Status', type: 'string', group: 'identity', initialValue: 'draft', options: {list: statusOptions, layout: 'radio'}, validation: (Rule) => Rule.required()}),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', group: 'identity', initialValue: false}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', group: 'identity', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'collection', title: 'Collection', type: 'reference', group: 'identity', to: [{type: 'collection'}], validation: (Rule) => Rule.custom((value, context) => requiredWhenActive(value, context, 'Collection is required for active products.'))}),
    defineField({name: 'shortDescription', title: 'Short description', type: 'text', rows: 3, group: 'story', validation: (Rule) => Rule.max(280)}),
    defineField({name: 'productStory', title: 'Product story', type: 'text', rows: 5, group: 'story', validation: (Rule) => Rule.max(1000)}),
    defineField({name: 'colors', title: 'Colors', type: 'array', group: 'story', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'dimensions', title: 'Dimensions', type: 'string', group: 'story'}),
    defineField({name: 'weight', title: 'Weight', type: 'string', group: 'story'}),
    defineField({name: 'materials', title: 'Materials', type: 'array', group: 'story', of: [defineArrayMember({type: 'string'})], validation: (Rule) => Rule.custom((value, context) => context.document?.status !== 'active' || value?.length || context.document?.benefits?.length ? true : 'Add at least one material or benefit for active products.')}),
    defineField({name: 'benefits', title: 'Benefits', type: 'array', group: 'story', of: [defineArrayMember({type: 'string'})]}),
    defineField({name: 'specifications', title: 'Specifications', type: 'array', group: 'story', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required()})], preview: {select: {title: 'label', subtitle: 'value'}}})]}),
    defineField({name: 'price', title: 'Price', type: 'number', group: 'commerce', validation: (Rule) => Rule.required().min(0)}),
    defineField({name: 'compareAtPrice', title: 'Compare-at price', type: 'number', group: 'commerce', validation: (Rule) => Rule.min(0).custom((value, context) => value == null || value >= (context.document?.price || 0) || 'Compare-at price cannot be lower than price.')}),
    defineField({name: 'currency', title: 'Currency', type: 'string', group: 'commerce', initialValue: 'IDR', options: {list: [{title: 'Indonesian Rupiah (IDR)', value: 'IDR'}]}}),
    defineField({name: 'stockStatus', title: 'Stock status', type: 'string', group: 'commerce', initialValue: 'inStock', options: {list: stockOptions}}),
    defineField({name: 'madeToOrder', title: 'Made to order', type: 'boolean', group: 'commerce', initialValue: false}),
    defineField({name: 'leadTime', title: 'Lead time', type: 'string', group: 'commerce'}),
    defineField({name: 'assemblyInformation', title: 'Assembly information', type: 'text', rows: 3, group: 'commerce'}),
    defineField({name: 'warranty', title: 'Warranty', type: 'text', rows: 3, group: 'commerce'}),
    defineField({name: 'deliveryNotes', title: 'Delivery notes', type: 'text', rows: 3, group: 'commerce'}),
    defineField({name: 'whatsAppMessage', title: 'WhatsApp message', type: 'text', rows: 3, group: 'commerce', validation: (Rule) => Rule.max(300)}),
    defineField({name: 'mainImage', title: 'Main image', type: 'cmsImage', group: 'media', validation: (Rule) => Rule.custom((value, context) => requiredWhenActive(value?.image?.asset, context, 'Main image is required for active products.'))}),
    defineField({name: 'galleryImages', title: 'Gallery images', type: 'array', group: 'media', of: [defineArrayMember({type: 'cmsImage'})]}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', validation: (Rule) => Rule.max(65)}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo', validation: (Rule) => Rule.max(165)}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', sku: 'sku', status: 'status', media: 'mainImage.image'},
    prepare: ({title, sku, status, media}) => ({title, subtitle: `${sku || 'No SKU'} · ${status || 'Draft'}`, media}),
  },
})
