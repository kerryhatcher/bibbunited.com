import React from 'react'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { DateDisplay } from '@/components/shared/DateDisplay'
import type { NewsPost, Media } from '@/payload-types'

interface LatestNewsProps {
  posts: NewsPost[]
}

function getImageUrl(post: NewsPost): string | undefined {
  const img = typeof post.featuredImage === 'object' ? post.featuredImage : null
  return img?.url || undefined
}

function getImageAlt(post: NewsPost): string {
  const img = typeof post.featuredImage === 'object' ? post.featuredImage : null
  return img?.alt || post.title
}

function getThumbnailUrl(post: NewsPost): string | undefined {
  const img = typeof post.featuredImage === 'object' ? (post.featuredImage as Media) : null
  return img?.sizes?.thumbnail?.url || img?.url || undefined
}

export function LatestNews({ posts }: LatestNewsProps) {
  if (!posts || posts.length === 0) {
    return (
      <Section>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-tight mb-8">
          Latest News
        </h2>
        <p className="text-text-secondary">No news posts published yet.</p>
      </Section>
    )
  }

  const [featured, ...rest] = posts
  const listItems = rest.slice(0, 4)

  return (
    <Section>
      <h2 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-tight mb-8">
        Latest News
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured large card */}
        <div className="lg:col-span-2">
          <Card
            imageSrc={getImageUrl(featured)}
            imageAlt={getImageAlt(featured)}
            href={`/news/${featured.slug}`}
          >
            <h3 className="text-2xl font-heading font-bold mb-2">
              {featured.title}
            </h3>
            <DateDisplay publishDate={featured.publishDate} variant="compact" />
          </Card>
        </div>

        {/* Smaller list items */}
        <div className="lg:col-span-1">
          {listItems.map((post) => (
            <a
              key={post.id}
              href={`/news/${post.slug}`}
              className="flex gap-4 items-start py-4 border-b border-border last:border-0 hover:text-accent transition-colors"
            >
              {getThumbnailUrl(post) && (
                <img
                  src={getThumbnailUrl(post)}
                  alt={getImageAlt(post)}
                  className="w-16 h-16 object-cover flex-shrink-0"
                />
              )}
              <div>
                <h4 className="font-heading font-bold text-sm leading-tight mb-1">
                  {post.title}
                </h4>
                <DateDisplay publishDate={post.publishDate} variant="compact" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <a
          href="/news"
          className="text-accent font-bold uppercase hover:underline"
        >
          View All News &rarr;
        </a>
      </div>
    </Section>
  )
}
