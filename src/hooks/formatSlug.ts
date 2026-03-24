import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

export const formatSlugHook: FieldHook = ({ data, operation, value }) => {
  if (operation === 'create' || !value) {
    const fallback = data?.title
    if (fallback && typeof fallback === 'string') {
      return formatSlug(fallback)
    }
  }
  return value
}
