import React from 'react'
import Image from 'next/image'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RichTextRenderer } from '@/components/shared/RichTextRenderer'
import { DateDisplay } from '@/components/shared/DateDisplay'
import { PrintButton } from '@/components/shared/PrintButton'
import { Button } from '@/components/ui/Button'
import {
  JsonLdScript,
  newsArticleJsonLd,
  breadcrumbJsonLd,
} from '@/lib/jsonLd'
import type { NewsPost, Media, User } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'news-posts',
    limit: 100,
    where: { _status: { equals: 'published' } },
    select: { slug: true },
  })
  return posts.docs
    .filter((post): post is typeof post & { slug: string } => typeof post.slug === 'string')
    .map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news-posts',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const post = result.docs[0]
  if (!post) return { title: 'Not Found' }

  const title = post.meta?.title || post.title
  const description = post.meta?.description || undefined
  // Use SEO image override, fall back to featured image
  const seoImage =
    typeof post.meta?.image === 'object'
      ? (post.meta.image as Media)?.url ?? null
      : null
  const featuredImg =
    typeof post.featuredImage === 'object'
      ? (post.featuredImage as Media)?.url ?? null
      : null
  const ogImage = seoImage || featuredImg

  return {
    title: `${title} | BIBB United`,
    description,
    openGraph: {
      title: `${title} | BIBB United`,
      description,
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      title: `${title} | BIBB United`,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function NewsArticlePage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news-posts',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  const post = result.docs[0] as NewsPost | undefined
  if (!post) notFound()

  const authorName =
    typeof post.author === 'object'
      ? (post.author as User).displayName || 'BIBB United Staff'
      : 'BIBB United Staff'

  const featuredImage =
    typeof post.featuredImage === 'object'
      ? (post.featuredImage as Media)
      : null

  return (
    <>
      <JsonLdScript
        data={newsArticleJsonLd({
          title: post.title,
          slug: post.slug || '',
          publishDate: post.publishDate,
          updatedAt: post.updatedAt,
          authorName: authorName,
          imageUrl: featuredImage?.url || undefined,
          description: post.meta?.description || undefined,
        })}
      />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Home', url: 'https://www.bibbunited.com' },
          { name: 'News', url: 'https://www.bibbunited.com/news' },
          {
            name: post.title,
            url: `https://www.bibbunited.com/news/${post.slug}`,
          },
        ])}
      />
      {featuredImage?.url && (
        <div className="w-full aspect-video relative">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || post.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <article className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <span className="text-text-secondary text-sm">
            By {authorName}
          </span>
          <DateDisplay
            publishDate={post.publishDate}
            updatedAt={post.updatedAt}
            variant="full"
          />
        </div>

        <div className="mb-8">
          <PrintButton />
        </div>

        <RichTextRenderer data={post.body} />

        {post.cta?.text && post.cta?.link && (
          <div className="mt-12 pt-8 border-t border-border text-center">
            <Button href={post.cta.link}>{post.cta.text}</Button>
          </div>
        )}
      </article>
    </>
  )
}
