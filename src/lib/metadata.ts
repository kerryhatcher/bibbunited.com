import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type PageMetaInput = {
  title: string
  description?: string
  slug?: string // e.g., 'news' or 'news/my-article' (no leading slash)
  type?: 'website' | 'article'
  image?: string | null // absolute URL or relative path to media
  publishedTime?: string
  author?: string
}

const SITE_URL = 'https://www.bibbunited.com'

async function getDefaultOgImage(): Promise<string> {
  try {
    const payload = await getPayload({ config: configPromise })
    const siteTheme = await payload.findGlobal({ slug: 'site-theme' })
    // SiteTheme ogDefaultImage -> static /og-default.png
    const ogImage =
      typeof siteTheme?.ogDefaultImage === 'object'
        ? siteTheme.ogDefaultImage?.url
        : null
    if (ogImage) return `${SITE_URL}${ogImage}`
  } catch {
    // Fall through to static fallback
  }
  return `${SITE_URL}/og-default.png`
}

export async function generatePageMeta(input: PageMetaInput): Promise<Metadata> {
  const { title, description, slug, type = 'website', image, publishedTime, author } = input

  const canonicalPath = slug ? `/${slug}` : '/'
  // per-page image -> SiteTheme ogDefaultImage -> static fallback
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : await getDefaultOgImage()

  return {
    title, // Short title -- layout template appends "| BIBB United"
    description,
    alternates: {
      canonical: canonicalPath, // resolves against metadataBase
    },
    openGraph: {
      title,
      description: description || undefined,
      url: canonicalPath,
      siteName: 'BIBB United',
      type,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && author ? { authors: [author] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      images: [ogImage],
    },
  }
}
