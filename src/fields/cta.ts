import type { Field } from 'payload'

export const ctaFields: Field = {
  name: 'cta',
  type: 'group',
  label: 'Call to Action',
  admin: {
    description: 'Add a call-to-action button to this content',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      label: 'Button Text',
      admin: {
        description: 'e.g., "Attend the next board meeting", "Contact your representative"',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Button URL',
      admin: {
        description: 'Full URL including https://',
      },
    },
  ],
}
