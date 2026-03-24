import type { Block } from 'payload'

export const Callout: Block = {
  slug: 'callout',
  labels: {
    singular: 'Callout Box',
    plural: 'Callout Boxes',
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Callout Content',
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Action Required', value: 'action' },
      ],
    },
  ],
}
