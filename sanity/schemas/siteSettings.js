import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings', title: 'Site Settings', type: 'document',
  groups: [{name: 'brand', title: 'Brand', default: true}, {name: 'contact', title: 'Contact'}, {name: 'seo', title: 'SEO'}],
  fields: [
    defineField({name: 'brandName', title: 'Brand name', type: 'string', group: 'brand', validation: (Rule) => Rule.required().max(80)}),
    defineField({name: 'brandPromise', title: 'Brand promise', type: 'string', group: 'brand', validation: (Rule) => Rule.max(180)}),
    defineField({name: 'logo', title: 'Logo', type: 'cmsImage', group: 'brand'}),
    defineField({name: 'favicon', title: 'Favicon', type: 'image', group: 'brand'}),
    defineField({name: 'whatsAppNumber', title: 'WhatsApp number', description: 'International format, digits only, without +.', type: 'string', group: 'contact', initialValue: '6282298887298', validation: (Rule) => Rule.required().regex(/^\d+$/, {name: 'international phone number', invert: false}).min(8).max(18)}),
    defineField({name: 'defaultWhatsAppMessage', title: 'Default WhatsApp message', type: 'text', rows: 3, group: 'contact', validation: (Rule) => Rule.max(300)}),
    defineField({name: 'instagramUrl', title: 'Instagram URL', type: 'url', group: 'contact', validation: (Rule) => Rule.uri({scheme: ['https']})}),
    defineField({name: 'instagramUsername', title: 'Instagram username', type: 'string', group: 'contact'}),
    defineField({name: 'email', title: 'Email', type: 'string', group: 'contact'}),
    defineField({name: 'businessAddress', title: 'Business address', type: 'text', rows: 3, group: 'contact'}),
    defineField({name: 'operatingHours', title: 'Operating hours', type: 'string', group: 'contact'}),
    defineField({name: 'deliveryArea', title: 'Delivery area', type: 'string', group: 'contact'}),
    defineField({name: 'footerText', title: 'Footer text', type: 'string', group: 'brand', validation: (Rule) => Rule.max(220)}),
    defineField({name: 'seoDefaultTitle', title: 'Default SEO title', type: 'string', group: 'seo', validation: (Rule) => Rule.max(65)}),
    defineField({name: 'seoDefaultDescription', title: 'Default SEO description', type: 'text', rows: 3, group: 'seo', validation: (Rule) => Rule.max(165)}),
    defineField({name: 'openGraphImage', title: 'Open Graph image', type: 'cmsImage', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Site Settings', subtitle: 'Brand, contact and SEO defaults'})},
})
