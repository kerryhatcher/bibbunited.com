import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

export function createFormatSlugHook(sourceField: string = 'title'): FieldHook {
  return ({ data, operation, value }) => {
    if (operation === 'create' || !value) {
      const fallback = data?.[sourceField]
      if (fallback && typeof fallback === 'string') {
        return formatSlug(fallback)
      }
    }
    return value
  }
}

// Backward-compatible default (generates slug from 'title' field)
export const formatSlugHook: FieldHook = createFormatSlugHook('title')
