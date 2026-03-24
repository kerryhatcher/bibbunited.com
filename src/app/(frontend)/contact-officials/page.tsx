import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Section } from '@/components/ui/Section'
import { Mail, Phone, User } from 'lucide-react'
import {
  JsonLdScript,
  governmentOrgJsonLd,
  breadcrumbJsonLd,
} from '@/lib/jsonLd'
import type { Official, Media } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Your Officials',
    description:
      'Contact information for local officials -- school board, county commission, and water board members.',
    openGraph: {
      title: 'Contact Your Officials | BIBB United',
      description:
        'Contact information for local officials -- school board, county commission, and water board members.',
    },
    twitter: {
      title: 'Contact Your Officials | BIBB United',
      description:
        'Contact information for local officials -- school board, county commission, and water board members.',
    },
  }
}

const bodyLabels: Record<string, string> = {
  'board-of-education': 'Board of Education',
  'county-commission': 'County Commission',
  'water-board': 'Water Board',
}

export default async function ContactOfficialsPage() {
  const payload = await getPayload({ config: configPromise })
  const officials = await payload.find({
    collection: 'officials',
    limit: 100,
    sort: 'sortOrder',
    depth: 1,
  })

  const grouped = officials.docs.reduce(
    (acc, official) => {
      const key = official.body as string
      if (!acc[key]) acc[key] = []
      acc[key].push(official)
      return acc
    },
    {} as Record<string, typeof officials.docs>,
  )

  const bodyOrder = ['board-of-education', 'county-commission', 'water-board']

  return (
    <Section>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Home', url: 'https://www.bibbunited.com' },
          {
            name: 'Contact Your Officials',
            url: 'https://www.bibbunited.com/contact-officials',
          },
        ])}
      />
      {bodyOrder.map((key) => {
        const group = grouped[key]
        if (!group || group.length === 0) return null
        return (
          <JsonLdScript
            key={`jsonld-${key}`}
            data={governmentOrgJsonLd(
              bodyLabels[key] || key,
              group.map((o) => ({
                name: o.name,
                role: o.role,
                email: o.email || undefined,
                phone: o.phone || undefined,
              })),
            )}
          />
        )
      })}
      <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-tight mb-4">
        Contact Your Officials
      </h1>
      <p className="text-text-secondary text-lg mb-12 max-w-[65ch]">
        Your elected and appointed officials work for you. Reach out directly
        &mdash; let them know what matters to your community.
      </p>

      {officials.docs.length === 0 && (
        <p className="text-text-secondary">
          No officials have been added yet. Check back soon.
        </p>
      )}

      {bodyOrder.map((key) => {
        const group = grouped[key]
        if (!group || group.length === 0) return null

        return (
          <div key={key}>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-tight mb-6 mt-12 first:mt-0">
              {bodyLabels[key] || key}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.map((official) => {
                const photo =
                  typeof official.photo === 'object'
                    ? (official.photo as Media)
                    : null

                return (
                  <div
                    key={official.id}
                    className="border border-border p-6 bg-bg-dominant"
                  >
                    {photo?.url && (
                      <img
                        src={photo.url}
                        alt={official.name}
                        className="w-20 h-20 rounded-full object-cover mb-4"
                      />
                    )}
                    <h3 className="text-xl font-heading font-bold">
                      {official.name}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      {official.role}
                    </p>
                    <div className="flex flex-col gap-2">
                      {official.email && (
                        <a
                          href={`mailto:${official.email}`}
                          className="flex items-center gap-2 text-accent hover:underline text-sm"
                        >
                          <Mail className="w-4 h-4" />
                          {official.email}
                        </a>
                      )}
                      {official.phone && (
                        <a
                          href={`tel:${official.phone}`}
                          className="flex items-center gap-2 text-accent hover:underline text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          {official.phone}
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </Section>
  )
}
