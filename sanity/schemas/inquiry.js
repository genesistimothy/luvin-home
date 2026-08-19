import {defineField, defineType} from 'sanity'

export const inquiry = defineType({
  name: 'inquiry',
  title: 'Inquiry',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      initialValue: 'contact',
      options: {list: [{title: 'Contact form', value: 'contact'}, {title: 'Service consultation', value: 'service'}]},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required().max(120)}),
    defineField({name: 'contact', title: 'Contact (email or phone)', type: 'string', validation: (Rule) => Rule.required().max(160)}),
    defineField({name: 'message', title: 'Message', type: 'text', rows: 5, validation: (Rule) => Rule.max(1500)}),
    defineField({name: 'roomType', title: 'Room type', type: 'string'}),
    defineField({name: 'budgetRange', title: 'Budget range', type: 'string'}),
    defineField({name: 'serviceName', title: 'Service', type: 'string'}),
    defineField({name: 'serviceSlug', title: 'Service slug', type: 'string'}),
    defineField({name: 'referenceImage', title: 'Reference image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {list: [{title: 'New', value: 'new'}, {title: 'Contacted', value: 'contacted'}, {title: 'Closed', value: 'closed'}]},
    }),
  ],
  orderings: [{title: 'Newest', name: 'createdDesc', by: [{field: '_createdAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'name', subtitle: 'contact', type: 'type', status: 'status'},
    prepare: ({title, subtitle, type, status}) => ({
      title: title || 'Inquiry',
      subtitle: `${type === 'service' ? 'Service' : 'Contact'} · ${subtitle || ''} · ${status || 'new'}`,
    }),
  },
})
