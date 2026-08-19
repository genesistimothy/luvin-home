import {defineArrayMember, defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (Rule) => Rule.required().max(140)}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: {source: 'title', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3, group: 'content', validation: (Rule) => Rule.max(280)}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'cmsImage', group: 'content'}),
    defineField({name: 'author', title: 'Author', type: 'string', group: 'content', initialValue: 'Luvin Home'}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime', group: 'content', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'image', options: {hotspot: true}})],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'content',
      initialValue: 'draft',
      options: {list: [{title: 'Draft', value: 'draft'}, {title: 'Published', value: 'published'}]},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo', validation: (Rule) => Rule.max(65)}),
    defineField({name: 'seoDescription', title: 'SEO description', type: 'text', rows: 3, group: 'seo', validation: (Rule) => Rule.max(165)}),
  ],
  orderings: [{title: 'Newest', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', status: 'status', media: 'coverImage.image'},
    prepare: ({title, status, media}) => ({title, subtitle: status === 'published' ? 'Published' : 'Draft', media}),
  },
})
