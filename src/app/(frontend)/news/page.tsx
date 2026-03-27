import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generatePageMeta } from '@/lib/metadata'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { JsonLdScript, breadcrumbJsonLd } from '@/lib/jsonLd'
import { getExcerpt } from '@/lib/lexicalToPlainText'
import type { NewsPost, Media } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMeta({
    title: 'News',
    description:
      'Latest news and updates from BIBB United about local school system issues, board decisions, and community advocacy.',
    slug: 'news',
  })
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

      <h1 className="text-fluid-page-title font-heading font-bold uppercase tracking-tight mb-8">
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
        (() => {
          const [featured, ...rest] = newsPosts.docs
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured first post — spans 2 columns */}
              <div className="lg:col-span-2">
                <Card
                  key={featured.id}
                  href={`/news/${featured.slug}`}
                  imageSrc={getImageUrl(featured)}
                  imageAlt={getImageAlt(featured)}
                >
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-2 line-clamp-2">
                    {featured.title}
                  </h2>
                  <p className="text-text-secondary text-base line-clamp-3 mb-2">
                    {featured.excerpt || getExcerpt(featured.body)}
                  </p>
                  <DateDisplay publishDate={featured.publishDate} variant="compact" />
                </Card>
              </div>

              {/* Remaining posts — list style in right column on desktop */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                {rest.map((post) => (
                  <Card
                    key={post.id}
                    href={`/news/${post.slug}`}
                  >
                    <h2 className="text-lg font-heading font-bold uppercase mb-1 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-text-secondary text-sm line-clamp-2 mb-2">
                      {post.excerpt || getExcerpt(post.body)}
                    </p>
                    <DateDisplay publishDate={post.publishDate} variant="compact" />
                  </Card>
                ))}
              </div>
            </div>
          )
        })()
      )}
    </Section>
  )
}
