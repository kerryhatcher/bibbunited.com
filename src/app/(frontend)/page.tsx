import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getHomepage } from '@/lib/getHomepage'
import { HeroSpotlight } from '@/components/homepage/HeroSpotlight'
import { LatestNews } from '@/components/homepage/LatestNews'
import { TopicCallouts } from '@/components/homepage/TopicCallouts'
import type { NewsPost, Media, Page as PageType } from '@/payload-types'

export const metadata: Metadata = {
  title: 'BIBB United — Civic Advocacy for the BIBB Community',
  description:
    'Informing and activating BIBB community residents on local school system issues.',
}

export default async function HomePage() {
  const homepage = await getHomepage()
  const payload = await getPayload({ config: configPromise })
  const latestNews = await payload.find({
    collection: 'news-posts',
    limit: 5,
    sort: '-publishDate',
    depth: 1,
  })

  // Transform hero stories for HeroSpotlight props
  const heroStories = (homepage.heroSpotlight || [])
    .map((item) => {
      const story = typeof item.story === 'object' ? item.story : null
      if (!story) return null
      const img = typeof story.featuredImage === 'object'
        ? (story.featuredImage as Media)
        : null
      return {
        title: story.title,
        slug: story.slug || '',
        featuredImage: { url: img?.url || '', alt: img?.alt || story.title },
        publishDate: story.publishDate,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  // Transform topic callouts
  const topicCallouts = (homepage.topicCallouts || []).map((item) => ({
    title: item.title,
    blurb: item.blurb,
    icon: item.icon || undefined,
    link: {
      slug: typeof item.link === 'object'
        ? (item.link as PageType).slug || ''
        : '',
    },
  }))

  return (
    <>
      <HeroSpotlight stories={heroStories} />
      <LatestNews posts={latestNews.docs} />
      {topicCallouts.length > 0 && <TopicCallouts callouts={topicCallouts} />}
    </>
  )
}
