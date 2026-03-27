import type { CollectionConfig } from 'payload'
import { createSlugField } from '../fields/slug'
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate'
import { preventOrganizationDelete } from '../hooks/preventReferencedDelete'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  hooks: {
    afterChange: [revalidateCollection(['/contact-officials'])],
    beforeDelete: [preventOrganizationDelete],
    afterDelete: [revalidateOnDelete(['/contact-officials'])],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'sortOrder', 'website'],
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
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: 'County', value: 'county' },
        { label: 'State', value: 'state' },
        { label: 'National', value: 'national' },
      ],
    },
    createSlugField('name'),
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'zip',
          type: 'text',
        },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within their level group',
      },
    },
    {
      name: 'officials',
      type: 'join',
      collection: 'officials',
      on: 'organization',
    },
  ],
}
