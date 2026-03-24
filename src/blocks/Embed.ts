import type { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  labels: {
    singular: 'Embedded Content',
    plural: 'Embedded Content',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
      admin: {
        description:
          'YouTube or Vimeo URL for board meeting recordings and external media',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional description shown below the embed',
      },
    },
  ],
}
