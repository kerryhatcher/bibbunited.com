import type { Field } from 'payload'
import { formatSlugHook } from '../hooks/formatSlug'

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Auto-generated from title. Edit to override.',
  },
  hooks: {
    beforeValidate: [formatSlugHook],
  },
}
