import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroSpotlight',
      type: 'array',
      label: 'Hero Spotlight Stories',
      maxRows: 5,
      minRows: 1,
      admin: {
        description: 'Select up to 5 featured stories for the rotating hero spotlight',
      },
      fields: [
        {
          name: 'story',
          type: 'relationship',
          relationTo: 'news-posts',
          required: true,
        },
      ],
    },
    {
      name: 'topicCallouts',
      type: 'array',
      label: 'Topic Callout Cards',
      maxRows: 4,
      minRows: 1,
      admin: {
        description: 'Featured topic cards below the news section',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'blurb',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Lucide icon name (e.g., "calendar", "users", "dollar-sign")',
          },
        },
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
        },
      ],
    },
  ],
}
