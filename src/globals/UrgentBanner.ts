import type { GlobalConfig } from 'payload'

export const UrgentBanner: GlobalConfig = {
  slug: 'urgent-banner',
  label: 'Urgent Banner',
  admin: {
    description:
      'Site-wide urgent message banner. Toggle on to display across the entire site.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Banner',
      admin: {
        description: 'Toggle the banner on or off site-wide',
      },
    },
    {
      name: 'message',
      type: 'text',
      required: true,
      label: 'Banner Message',
      admin: {
        condition: (data) => Boolean(data?.active),
        description:
          'The urgent message to display (keep it short and actionable)',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Banner Link',
      admin: {
        condition: (data) => Boolean(data?.active),
        description:
          'Optional URL — e.g., link to a meeting page or contact form',
      },
    },
  ],
}
