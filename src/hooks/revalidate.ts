import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

/**
 * Revalidate specific paths when a collection document changes.
 */
export function revalidateCollection(
  paths: string[] | ((doc: any) => string[]),
): CollectionAfterChangeHook {
  return ({ doc, req }) => {
    if (!req.context?.disableRevalidate) {
      const resolved = typeof paths === 'function' ? paths(doc) : paths
      for (const path of resolved) {
        revalidatePath(path)
      }
    }
    return doc
  }
}

/**
 * Revalidate when a global changes.
 * Use 'layout' type to cascade revalidation to all pages sharing the root layout.
 */
export function revalidateGlobal(
  paths: string[],
  type?: 'page' | 'layout',
): GlobalAfterChangeHook {
  return ({ doc, req }) => {
    if (!req.context?.disableRevalidate) {
      for (const path of paths) {
        revalidatePath(path, type)
      }
    }
    return doc
  }
}
