import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { ctaFields } from '../fields/cta'
import { richTextEditor } from '../editors/richText'
import { revalidateCollection } from '../hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    afterChange: [
      revalidateCollection((doc) => [`/${doc.slug}`]),
    ],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1500,
      },
      schedulePublish: true,
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField,
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: richTextEditor,
    },
    ctaFields,
  ],
}
