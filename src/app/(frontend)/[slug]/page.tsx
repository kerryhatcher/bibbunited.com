import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { generatePageMeta } from '@/lib/metadata'
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
    where: { _status: { equals: 'published' } },
    select: { slug: true },
  })
  return pages.docs
    .filter((page): page is typeof page & { slug: string } => typeof page.slug === 'string')
    .map((page) => ({ slug: page.slug }))
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

  const seoImage =
    typeof page.meta?.image === 'object'
      ? (page.meta.image as Media)?.url ?? null
      : null

  return generatePageMeta({
    title: page.meta?.title || page.title,
    description: page.meta?.description || page.title + ' - BIBB United community information and resources',
    slug,
    image: seoImage,
  })
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
        <h1 className="text-fluid-page-title font-heading font-bold uppercase tracking-tight mb-8">
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
