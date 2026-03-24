import type { GlobalConfig } from 'payload'

export const SiteTheme: GlobalConfig = {
  slug: 'site-theme',
  label: 'Site Theme',
  admin: {
    description:
      'Control the site-wide visual mode. "Community" is light and welcoming. "Urgent" is dark and bold for high-priority periods.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'community',
      label: 'Visual Mode',
      options: [
        { label: 'Community (Light)', value: 'community' },
        { label: 'Urgent (Dark)', value: 'urgent' },
      ],
      admin: {
        description:
          'Switch between community (light, welcoming) and urgent (dark, bold) visual modes',
      },
    },
  ],
}
