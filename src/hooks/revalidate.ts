import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

/**
 * Safely call revalidatePath only when running inside a Next.js server action
 * or API route (not during SSR render). In Next.js 15, calling revalidatePath
 * during render is unsupported and breaks the render pipeline even inside
 * try-catch, so we must guard against it.
 */
function safeRevalidate(path: string, type?: 'page' | 'layout'): void {
  try {
    // Dynamic import avoids module-level side effects and lets us
    // catch the "called during render" error that Next.js 15 throws.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { revalidatePath } = require('next/cache')
    revalidatePath(path, type)
  } catch {
    // revalidatePath throws during SSR render -- silently ignore
  }
}

/**
 * Revalidate specific paths when a collection document changes.
 * Skips revalidation when:
 * - req.context.disableRevalidate is set (e.g. seed scripts)
 * - The hook fires during SSR render (create-form draft initialization)
 * - The resolved path contains null/undefined segments
 */
export function revalidateCollection(
  paths: string[] | ((doc: any) => string[]),
): CollectionAfterChangeHook {
  return ({ doc, req, context }) => {
    // Skip revalidation during SSR render or when explicitly disabled
    if (req.context?.disableRevalidate || context?.disableRevalidate) return doc

    // Skip when triggered during Payload's internal SSR document rendering.
    // When Payload renders the create form, it may run createOperation internally
    // which triggers afterChange. We detect this by checking if the request
    // appears to be a page render (GET) rather than a mutation (POST/PATCH).
    const method = req?.method?.toUpperCase?.()
    if (method === 'GET') return doc

    const resolved = typeof paths === 'function' ? paths(doc) : paths
    for (const path of resolved) {
      if (!path || path.includes('undefined') || path.includes('null')) continue
      safeRevalidate(path)
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
  return ({ doc, req, context }) => {
    if (req.context?.disableRevalidate || context?.disableRevalidate) return doc

    const method = req?.method?.toUpperCase?.()
    if (method === 'GET') return doc

    for (const path of paths) {
      safeRevalidate(path, type)
    }
    return doc
  }
}
