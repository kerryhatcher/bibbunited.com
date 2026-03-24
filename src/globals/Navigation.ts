import type { GlobalConfig } from 'payload'
import { linkFields } from '../fields/link'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Site Navigation',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      maxRows: 8,
      label: 'Navigation Items',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        ...linkFields({ relationTo: ['pages', 'news-posts'], disableLabel: true }),
        {
          name: 'children',
          type: 'array',
          maxRows: 6,
          label: 'Dropdown Items',
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            ...linkFields({ relationTo: ['pages', 'news-posts'], disableLabel: true }),
          ],
        },
      ],
    },
  ],
}
