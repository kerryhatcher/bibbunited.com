import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RichTextRenderer } from '@/components/shared/RichTextRenderer'
import { Button } from '@/components/ui/Button'
import type { Page } from '@/payload-types'

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
    limit: 1,
  })
  const page = result.docs[0]
  if (!page) return { title: 'Not Found' }
  return { title: `${page.title} | BIBB United` }
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
  )
}
