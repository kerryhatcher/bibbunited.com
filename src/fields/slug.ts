import type { Field } from 'payload'
import { createFormatSlugHook } from '../hooks/formatSlug'

export function createSlugField(sourceField: string = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: `Auto-generated from ${sourceField}. Edit to override.`,
    },
    hooks: {
      beforeValidate: [createFormatSlugHook(sourceField)],
    },
  }
}

// Backward-compatible default (generates slug from 'title' field)
export const slugField: Field = createSlugField('title')
