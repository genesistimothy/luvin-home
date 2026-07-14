import {defineField, defineType} from 'sanity'

export const faq = defineType({
  name: 'faq', title: 'FAQ', type: 'document',
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required().max(180)}),
    defineField({name: 'answer', title: 'Answer', type: 'text', rows: 5, validation: (Rule) => Rule.required().max(900)}),
    defineField({name: 'category', title: 'Category', type: 'string', initialValue: 'General', options: {list: ['Order', 'Delivery', 'Assembly', 'Material', 'Warranty', 'Care', 'General']}, validation: (Rule) => Rule.required()}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', initialValue: 100, validation: (Rule) => Rule.integer().min(0)}),
    defineField({name: 'active', title: 'Active', type: 'boolean', initialValue: true}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {select: {title: 'question', subtitle: 'category'}},
})
