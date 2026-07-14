import {defineField, defineType} from 'sanity'

export const collection = defineType({
  name: 'collection', title: 'Collection', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required().max(100)}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, validation: (Rule) => Rule.max(280)}),
    defineField({name: 'longDescription', title: 'Long description', type: 'text', rows: 6}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'cmsImage', validation: (Rule) => Rule.custom((value, context) => !context.document?.active || value?.image?.asset ? true : 'Cover image is required for active collections.')}),
    defineField({name: 'featured', title: 'Featured', type: 'boolean', initialValue: false}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: false}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', validation: (Rule) => Rule.max(65)}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, validation: (Rule) => Rule.max(165)}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {select: {title: 'name', active: 'active', media: 'coverImage.image'}, prepare: ({title, active, media}) => ({title, subtitle: active ? 'Active' : 'Hidden', media})},
})
