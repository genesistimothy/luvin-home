import {defineArrayMember, defineField, defineType} from 'sanity'

const roomTypes = ['Living Room', 'Dining Room', 'Bedroom', 'Kitchen', 'Workspace', 'Entryway', 'Other']

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (Rule) => Rule.required().max(120)}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: {source: 'title', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'roomType', title: 'Room type', type: 'string', group: 'content', options: {list: roomTypes}, validation: (Rule) => Rule.required()}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, group: 'content', validation: (Rule) => Rule.max(280)}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'cmsImage', group: 'content', validation: (Rule) => Rule.custom((value, context) => !context.document?.active || value?.image?.asset ? true : 'Cover image is required for active projects.')}),
    defineField({name: 'beforeImage', title: 'Before image', type: 'cmsImage', group: 'content'}),
    defineField({name: 'afterImage', title: 'After image', type: 'cmsImage', group: 'content'}),
    defineField({name: 'gallery', title: 'Gallery', type: 'array', group: 'content', of: [defineArrayMember({type: 'cmsImage'})]}),
    defineField({name: 'relatedProducts', title: 'Related products', type: 'array', group: 'content', of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})]}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', group: 'content', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Active', type: 'boolean', group: 'content', initialValue: false}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', validation: (Rule) => Rule.max(65)}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo', validation: (Rule) => Rule.max(165)}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'roomType', media: 'coverImage.image'},
  },
})
