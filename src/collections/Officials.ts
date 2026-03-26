import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Officials: CollectionConfig = {
  slug: 'officials',
  hooks: {
    afterChange: [revalidateCollection(['/contact-officials'])],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'body', 'email'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      label: 'Title / Role',
    },
    {
      name: 'body',
      type: 'select',
      required: true,
      label: 'Governing Body',
      options: [
        { label: 'Board of Education', value: 'board-of-education' },
        { label: 'County Commission', value: 'county-commission' },
        { label: 'Water Board', value: 'water-board' },
      ],
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional headshot photo',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within their group',
      },
    },
  ],
}
