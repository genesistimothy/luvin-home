import {defineArrayMember, defineField, defineType} from 'sanity'

const short = (Rule) => Rule.max(120)
const heading = (Rule) => Rule.max(100)

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'story', title: 'Story & Philosophy'},
    {name: 'sections', title: 'Section headings'},
    {name: 'contact', title: 'Intelligence & Contact'},
  ],
  fields: [
    defineField({name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string', group: 'hero', validation: short}),
    defineField({name: 'heroTitle', title: 'Hero title', type: 'string', group: 'hero', validation: (Rule) => Rule.required().max(110)}),
    defineField({name: 'heroDescription', title: 'Hero description', type: 'text', rows: 3, group: 'hero', validation: (Rule) => Rule.max(320)}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'cmsImage', group: 'hero', validation: (Rule) => Rule.required()}),
    defineField({name: 'heroPrimaryCtaLabel', title: 'Primary CTA label', type: 'string', group: 'hero', validation: short}),
    defineField({name: 'heroPrimaryCtaTarget', title: 'Primary CTA target', type: 'string', group: 'hero', validation: short}),
    defineField({name: 'heroSecondaryCtaLabel', title: 'Secondary CTA label', type: 'string', group: 'hero', validation: short}),
    defineField({name: 'heroSecondaryCtaTarget', title: 'Secondary CTA target', type: 'string', group: 'hero', validation: short}),
    defineField({name: 'brandStoryEyebrow', title: 'Brand story eyebrow', type: 'string', group: 'story', validation: short}),
    defineField({name: 'brandStoryTitle', title: 'Brand story title', type: 'string', group: 'story', validation: heading}),
    defineField({name: 'brandStoryParagraphs', title: 'Brand story paragraphs', type: 'array', group: 'story', of: [defineArrayMember({type: 'text', rows: 4})], validation: (Rule) => Rule.max(4)}),
    defineField({name: 'philosophyEyebrow', title: 'Philosophy eyebrow', type: 'string', group: 'story', validation: short}),
    defineField({name: 'philosophyTitle', title: 'Philosophy title', type: 'string', group: 'story', validation: heading}),
    defineField({name: 'philosophyDescription', title: 'Philosophy description', type: 'text', rows: 3, group: 'story', validation: (Rule) => Rule.max(320)}),
    defineField({name: 'featuredCollections', title: 'Featured collections', type: 'array', group: 'sections', of: [defineArrayMember({type: 'reference', to: [{type: 'collection'}]})]}),
    defineField({name: 'featuredProducts', title: 'Featured products', type: 'array', group: 'sections', of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})]}),
    ...[
      ['galleryEyebrow', 'Gallery eyebrow'], ['galleryTitle', 'Gallery title'], ['galleryDescription', 'Gallery description'],
      ['valuesEyebrow', 'Values eyebrow'], ['valuesTitle', 'Values title'],
      ['testimonialEyebrow', 'Testimonial eyebrow'], ['testimonialTitle', 'Testimonial title'],
      ['faqEyebrow', 'FAQ eyebrow'], ['faqTitle', 'FAQ title'],
    ].map(([name, title]) => defineField({name, title, type: name.endsWith('Description') ? 'text' : 'string', group: 'sections', validation: name.endsWith('Title') ? heading : short})),
    defineField({name: 'intelligenceEyebrow', title: 'Intelligence eyebrow', type: 'string', group: 'contact', validation: short}),
    defineField({name: 'intelligenceTitle', title: 'Intelligence title', type: 'string', group: 'contact', validation: heading}),
    defineField({name: 'intelligenceDescription', title: 'Intelligence description', type: 'text', rows: 3, group: 'contact', validation: (Rule) => Rule.max(360)}),
    defineField({name: 'intelligenceCtaLabel', title: 'Intelligence CTA label', type: 'string', group: 'contact', validation: short}),
    defineField({name: 'contactEyebrow', title: 'Contact eyebrow', type: 'string', group: 'contact', validation: short}),
    defineField({name: 'contactTitle', title: 'Contact title', type: 'string', group: 'contact', validation: heading}),
    defineField({name: 'contactDescription', title: 'Contact description', type: 'text', rows: 3, group: 'contact', validation: (Rule) => Rule.max(320)}),
    defineField({name: 'contactPrimaryCtaLabel', title: 'Contact primary CTA label', type: 'string', group: 'contact', validation: short}),
    defineField({name: 'contactSecondaryCtaLabel', title: 'Contact secondary CTA label', type: 'string', group: 'contact', validation: short}),
  ],
  preview: {prepare: () => ({title: 'Homepage', subtitle: 'Single homepage document'})},
})
