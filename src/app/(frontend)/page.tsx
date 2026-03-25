import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getHomepage } from '@/lib/getHomepage'
import { HeroSpotlight } from '@/components/homepage/HeroSpotlight'
import { LatestNews } from '@/components/homepage/LatestNews'
import { TopicCallouts } from '@/components/homepage/TopicCallouts'
import { JsonLdScript, organizationJsonLd, websiteJsonLd } from '@/lib/jsonLd'
import type { NewsPost, Media, Page as PageType } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const latestNews = await payload.find({
    collection: 'news-posts',
    limit: 1,
    sort: '-publishDate',
    depth: 1,
    where: { _status: { equals: 'published' } },
  })
  const firstPost = latestNews.docs[0]
  const featuredImg =
    typeof firstPost?.featuredImage === 'object'
      ? (firstPost.featuredImage as Media)?.url ?? null
      : null
  // Construct absolute URL: prepend serverUrl to relative media path
  const ogImage = featuredImg
    ? `${serverUrl}${featuredImg}`
    : `${serverUrl}/og-default.png`

  return {
    title: 'BIBB United -- Civic Advocacy for the BIBB Community',
    description:
      'Informing and activating BIBB community residents on local school system issues.',
    openGraph: {
      title: 'BIBB United -- Civic Advocacy for the BIBB Community',
      description:
        'Informing and activating BIBB community residents on local school system issues.',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  }
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
      <h1 className="sr-only">BIBB United -- Civic Advocacy for the BIBB Community</h1>
      <JsonLdScript data={organizationJsonLd()} />
      <JsonLdScript data={websiteJsonLd()} />
      <HeroSpotlight stories={heroStories} />
      <LatestNews posts={latestNews.docs} />
      {topicCallouts.length > 0 && <TopicCallouts callouts={topicCallouts} />}
    </>
  )
}
