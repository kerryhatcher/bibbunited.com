import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { ctaFields } from '../fields/cta'
import { richTextEditor } from '../editors/richText'

export const NewsPosts: CollectionConfig = {
  slug: 'news-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishDate', '_status', 'updatedAt'],
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
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      maxLength: 160,
      admin: {
        description: 'Short summary for news listing cards. If empty, auto-generated from body content.',
      },
    },
    slugField,
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Select the author of this post',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: richTextEditor,
    },
    ctaFields,
  ],
}
