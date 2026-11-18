import {defineField, defineType} from 'sanity'

/**
 * One document per ended session. Written by /api/auth/logout and read by
 * requireAdmin; kept in the dataset so revocation needs no extra service.
 */
export const sessionRevocation = defineType({
  name: 'sessionRevocation',
  title: 'Session revocation',
  type: 'document',
  fields: [
    defineField({name: 'jti', title: 'Session id', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'expiresAt', title: 'Token expiry', type: 'datetime'}),
  ],
  preview: {
    select: {title: 'jti', subtitle: 'expiresAt'},
  },
})
