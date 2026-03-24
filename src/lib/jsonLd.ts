import React from 'react'

const SITE_URL = 'https://www.bibbunited.com'
const SITE_NAME = 'BIBB United'

/**
 * XSS-safe JSON-LD renderer per Next.js official guidance.
 * Replaces `<` with unicode `\u003c` escape to prevent script injection.
 * This is the documented safe pattern for JSON-LD: the data is not rendered
 * as HTML, and the escape prevents breaking out of the script tag.
 */
export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  // Sanitize: escape < to prevent script tag injection in JSON-LD
  const sanitizedJson = JSON.stringify(data).replace(/</g, '\\u003c')
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: sanitizedJson,
    },
  })
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export function newsArticleJsonLd(post: {
  title: string
  slug: string
  publishDate: string
  updatedAt: string
  authorName: string
  imageUrl?: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.publishDate,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/news/${post.slug}`,
    ...(post.imageUrl && { image: post.imageUrl }),
    ...(post.description && { description: post.description }),
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function governmentOrgJsonLd(
  bodyName: string,
  officials: {
    name: string
    role: string
    email?: string
    phone?: string
  }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: bodyName,
    member: officials.map((official) => ({
      '@type': 'Person',
      name: official.name,
      jobTitle: official.role,
      ...(official.email && { email: `mailto:${official.email}` }),
      ...(official.phone && { telephone: official.phone }),
    })),
  }
}
