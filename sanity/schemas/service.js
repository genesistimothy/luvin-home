import {defineArrayMember, defineField, defineType} from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', group: 'content', validation: (Rule) => Rule.required().max(120)}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: {source: 'name', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3, group: 'content', validation: (Rule) => Rule.max(280)}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'cmsImage', group: 'content'}),
    defineField({
      name: 'processSteps',
      title: 'Process steps',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(80)}),
            defineField({name: 'description', title: 'Description', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(300)}),
          ],
          preview: {select: {title: 'title', subtitle: 'description'}},
        }),
      ],
    }),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', group: 'content', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Active', type: 'boolean', group: 'content', initialValue: false}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', validation: (Rule) => Rule.max(65)}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo', validation: (Rule) => Rule.max(165)}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', active: 'active', media: 'heroImage.image'},
    prepare: ({title, active, media}) => ({title, subtitle: active ? 'Active' : 'Hidden', media}),
  },
})
