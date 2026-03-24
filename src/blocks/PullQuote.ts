import type { Block } from 'payload'

export const PullQuote: Block = {
  slug: 'pullQuote',
  labels: {
    singular: 'Pull Quote',
    plural: 'Pull Quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Quote Text',
    },
    {
      name: 'attribution',
      type: 'text',
      label: 'Attribution',
      admin: {
        description: 'Who said this (optional)',
      },
    },
  ],
}
