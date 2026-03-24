import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'displayName',
      type: 'text',
      label: 'Display Name',
      admin: {
        description: 'Public name shown on article bylines. Falls back to "BIBB United Staff" if empty.',
      },
    },
  ],
}
