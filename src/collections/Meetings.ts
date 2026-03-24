import type { CollectionConfig } from 'payload'

export const Meetings: CollectionConfig = {
  slug: 'meetings',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'time', 'location'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "Regular Board Meeting", "Budget Work Session"',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'time',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., "6:00 PM"',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
    },
    {
      name: 'agendaLink',
      type: 'text',
      label: 'Agenda Link',
      admin: {
        description: 'Optional URL to meeting agenda document',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes (e.g., "Public comment period at 6:30 PM")',
      },
    },
  ],
}
