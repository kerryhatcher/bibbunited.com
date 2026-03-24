import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { JsonLdScript, breadcrumbJsonLd } from '@/lib/jsonLd'
import type { NewsPost, Media } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'News',
    description:
      'Latest news and updates from BIBB United about local school system issues, board decisions, and community advocacy.',
    openGraph: {
      title: 'News | BIBB United',
      description:
        'Latest news and updates from BIBB United about local school system issues, board decisions, and community advocacy.',
    },
    twitter: {
      title: 'News | BIBB United',
      description:
        'Latest news and updates from BIBB United about local school system issues, board decisions, and community advocacy.',
    },
  }
}

function getImageUrl(post: NewsPost): string | undefined {
  const img =
    typeof post.featuredImage === 'object' ? post.featuredImage : null
  return img?.url || undefined
}

function getImageAlt(post: NewsPost): string {
  const img =
    typeof post.featuredImage === 'object' ? post.featuredImage : null
  return img?.alt || post.title
}

export default async function NewsListingPage() {
  const payload = await getPayload({ config: configPromise })
  const newsPosts = await payload.find({
    collection: 'news-posts',
    limit: 50,
    sort: '-publishDate',
    where: { _status: { equals: 'published' } },
    depth: 1,
  })

  return (
    <Section>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Home', url: 'https://www.bibbunited.com' },
          { name: 'News', url: 'https://www.bibbunited.com/news' },
        ])}
      />

      <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-tight mb-8">
        NEWS
      </h1>

      {newsPosts.docs.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-heading font-bold uppercase mb-4">
            No News Published Yet
          </h2>
          <p className="text-text-secondary">
            Check back soon. Our editorial team is working on coverage of local
            school system issues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsPosts.docs.map((post) => (
            <Card
              key={post.id}
              href={`/news/${post.slug}`}
              imageSrc={getImageUrl(post)}
              imageAlt={getImageAlt(post)}
            >
              <h2 className="text-xl font-heading font-bold uppercase mb-2">
                {post.title}
              </h2>
              <DateDisplay publishDate={post.publishDate} variant="compact" />
            </Card>
          ))}
        </div>
      )}
    </Section>
  )
}
