import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const SITE_URL = 'https://www.bibbunited.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  // Fetch all published news posts
  const newsPosts = await payload.find({
    collection: 'news-posts',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    select: { slug: true, updatedAt: true },
  })

  // Fetch all published CMS pages
  const pages = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    select: { slug: true, updatedAt: true },
  })

  // per D-02: news articles at priority 0.7
  const newsEntries: MetadataRoute.Sitemap = newsPosts.docs
    .filter((p) => p.slug)
    .map((post) => ({
      url: `${SITE_URL}/news/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  // per D-02: CMS pages at priority 0.8
  const pageEntries: MetadataRoute.Sitemap = pages.docs
    .filter((p) => p.slug)
    .map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    // per INFRA-03: homepage at priority 1.0
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // per D-02: static civic pages at priority 0.8
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/meetings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact-officials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...pageEntries,
    ...newsEntries,
  ]
}
