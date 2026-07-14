import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial', title: 'Testimonial', type: 'document',
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 5, validation: (Rule) => Rule.required().max(700)}),
    defineField({name: 'customerName', title: 'Customer name', type: 'string'}),
    defineField({name: 'city', title: 'City', type: 'string'}),
    defineField({name: 'purchasedProduct', title: 'Purchased product', type: 'reference', to: [{type: 'product'}]}),
    defineField({name: 'customerPhoto', title: 'Customer photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'contentType', title: 'Content type', type: 'string', initialValue: 'customer', options: {list: [{title: 'Customer', value: 'customer'}, {title: 'Editorial placeholder', value: 'editorialPlaceholder'}]}, validation: (Rule) => Rule.required()}),
    defineField({name: 'permissionConfirmed', title: 'Permission confirmed', description: 'Confirm written permission before publishing customer content.', type: 'boolean', initialValue: false}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: false, validation: (Rule) => Rule.custom((active, context) => !active || context.document?.contentType === 'editorialPlaceholder' || context.document?.permissionConfirmed ? true : 'Confirm customer permission before activating this testimonial.')}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {select: {quote: 'quote', name: 'customerName', city: 'city', type: 'contentType', media: 'customerPhoto'}, prepare: ({quote, name, city, type, media}) => ({title: name || (type === 'editorialPlaceholder' ? 'Editorial placeholder' : 'Anonymous customer'), subtitle: `${city ? `${city} · ` : ''}${quote || ''}`, media})},
})
