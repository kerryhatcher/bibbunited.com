import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RichTextRenderer } from '@/components/shared/RichTextRenderer'
import { Button } from '@/components/ui/Button'
import { JsonLdScript, breadcrumbJsonLd } from '@/lib/jsonLd'
import type { Page, Media } from '@/payload-types'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    limit: 100,
    select: { slug: true },
  })
  return pages.docs.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const page = result.docs[0]
  if (!page) return { title: 'Not Found' }

  const title = page.meta?.title || page.title
  const description = page.meta?.description || undefined
  const ogImage =
    typeof page.meta?.image === 'object'
      ? (page.meta.image as Media)?.url ?? null
      : null

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

export default async function StaticPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  const page = result.docs[0] as Page | undefined
  if (!page) notFound()

  return (
    <>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Home', url: 'https://www.bibbunited.com' },
          { name: page.title, url: `https://www.bibbunited.com/${page.slug}` },
        ])}
      />
      <article className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-tight mb-8">
          {page.title}
        </h1>

      <RichTextRenderer data={page.content} />

      {page.cta?.text && page.cta?.link && (
        <div className="mt-12 pt-8 border-t border-border text-center">
          <Button href={page.cta.link}>{page.cta.text}</Button>
        </div>
      )}
    </article>
    </>
  )
}
