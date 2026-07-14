import {defineField, defineType} from 'sanity'

export const cmsImage = defineType({
  name: 'cmsImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alternative text',
      description: 'Describe the image for visitors who use a screen reader.',
      type: 'string',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string', validation: (Rule) => Rule.max(180)}),
  ],
  preview: {
    select: {title: 'altText', subtitle: 'caption', media: 'image'},
  },
})
