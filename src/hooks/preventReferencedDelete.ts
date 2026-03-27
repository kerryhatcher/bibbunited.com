import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

type BeforeDeleteHook = NonNullable<NonNullable<CollectionConfig['hooks']>['beforeDelete']>[number]

/**
 * Prevents deletion of a news post that is currently featured in the
 * Homepage Spotlight. Without this guard, PostgreSQL throws a 500 because
 * the homepage_hero_spotlight.story_id column is NOT NULL but the FK uses
 * ON DELETE SET NULL — an irreconcilable constraint pair.
 */
export const preventSpotlightNewsDelete: BeforeDeleteHook = async ({ id, req }) => {
  const homepage = await req.payload.findGlobal({ slug: 'homepage', depth: 0 })

  const isInSpotlight = homepage.heroSpotlight?.some((entry) => {
    const storyId = typeof entry.story === 'object' ? entry.story.id : entry.story
    return storyId === id
  })

  if (isInSpotlight) {
    throw new APIError(
      'This post is currently featured in the Homepage Spotlight. Remove it from Homepage Settings before deleting.',
      400,
    )
  }
}

/**
 * Prevents deletion of a page that is currently used as a Topic Callout
 * link on the homepage. Same NOT NULL + ON DELETE SET NULL conflict.
 */
export const preventCalloutPageDelete: BeforeDeleteHook = async ({ id, req }) => {
  const homepage = await req.payload.findGlobal({ slug: 'homepage', depth: 0 })

  const isInCallouts = homepage.topicCallouts?.some((entry) => {
    const linkId = typeof entry.link === 'object' ? entry.link.id : entry.link
    return linkId === id
  })

  if (isInCallouts) {
    throw new APIError(
      'This page is currently used as a Topic Callout link on the homepage. Remove it from Homepage Settings before deleting.',
      400,
    )
  }
}
