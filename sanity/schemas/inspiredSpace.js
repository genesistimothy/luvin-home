import {defineArrayMember, defineField, defineType} from 'sanity'

export const inspiredSpace = defineType({
  name: 'inspiredSpace', title: 'Inspired Space', type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(120)}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}, validation: (Rule) => Rule.required()}),
    defineField({name: 'altText', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required().max(160)}),
    defineField({name: 'caption', title: 'Caption', type: 'string', validation: (Rule) => Rule.max(180)}),
    defineField({name: 'roomType', title: 'Room type', type: 'string', options: {list: ['Living Room', 'Dining Room', 'Bedroom', 'Workspace', 'Entryway', 'Other']}, validation: (Rule) => Rule.required()}),
    defineField({name: 'relatedProducts', title: 'Related products', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})]}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'roomType', media: 'image'}},
})
