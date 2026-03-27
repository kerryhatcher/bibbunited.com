import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generatePageMeta } from '@/lib/metadata'
import { Section } from '@/components/ui/Section'
import { Mail, Phone, Users } from 'lucide-react'
import {
  JsonLdScript,
  governmentOrgJsonLd,
  breadcrumbJsonLd,
} from '@/lib/jsonLd'
import { Button } from '@/components/ui/Button'
import type { Official, Organization, Media } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMeta({
    title: 'Contact Your Officials',
    description:
      'Contact information for local officials -- school board, county commission, and water board members.',
    slug: 'contact-officials',
  })
}

export default async function ContactOfficialsPage() {
  const payload = await getPayload({ config: configPromise })

  // Query all organizations sorted by sortOrder
  const orgsResult = await payload.find({
    collection: 'organizations',
    limit: 100,
    sort: 'sortOrder',
    depth: 0,
  })

  // Query all officials with populated organization
  const officialsResult = await payload.find({
    collection: 'officials',
    limit: 200,
    sort: 'sortOrder',
    depth: 1,
  })

  // Group by level (County, State, National in fixed order per D-06)
  const levelOrder = ['county', 'state', 'national'] as const
  const levelLabels: Record<string, string> = {
    county: 'County',
    state: 'State',
    national: 'National',
  }

  // Build nested structure: level -> orgs (sorted by sortOrder) -> officials (sorted by sortOrder)
  type GroupedData = {
    level: string
    levelLabel: string
    orgs: {
      org: Organization
      officials: Official[]
    }[]
  }[]

  const grouped: GroupedData = levelOrder
    .map((level) => {
      const levelOrgs = orgsResult.docs
        .filter((org) => org.level === level)
        // Already sorted by sortOrder from query, but ensure order
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

      return {
        level,
        levelLabel: levelLabels[level],
        orgs: levelOrgs.map((org) => ({
          org: org as Organization,
          officials: officialsResult.docs
            .filter((official) => {
              const officialOrg = official.organization
              const orgId =
                typeof officialOrg === 'object' ? officialOrg?.id : officialOrg
              return orgId === org.id
            })
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        })),
      }
    })
    .filter((levelGroup) => levelGroup.orgs.length > 0)

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
      {grouped.map((levelGroup) =>
        levelGroup.orgs.map(({ org, officials: orgOfficials }) => (
          <JsonLdScript
            key={`jsonld-${org.id}`}
            data={governmentOrgJsonLd(
              org.name,
              orgOfficials.map((o) => ({
                name: o.name,
                role: o.role,
                email: o.email || undefined,
                phone: o.phone || undefined,
              })),
            )}
          />
        )),
      )}
      <h1 className="text-fluid-page-title font-heading font-bold uppercase tracking-tight mb-4">
        Contact Your Officials
      </h1>
      <p className="text-text-secondary text-lg mb-12 max-w-[65ch]">
        Your elected and appointed officials work for you. Reach out directly
        &mdash; let them know what matters to your community.
      </p>

      {officialsResult.docs.length === 0 && (
        <div className="text-center py-12 border border-border bg-bg-dominant">
          <Users className="mx-auto h-12 w-12 text-text-secondary mb-4" />
          <h2 className="text-2xl font-heading font-bold uppercase mb-4">
            No Officials Listed Yet
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            We&apos;re working on compiling contact information for your local
            officials. In the meantime, reach out to us directly.
          </p>
          <Button href="/about">Contact Us</Button>
        </div>
      )}

      {grouped.map((levelGroup) => (
        <div key={levelGroup.level}>
          {levelGroup.orgs.map(({ org, officials: orgOfficials }) => {
            if (orgOfficials.length === 0) return null

            return (
              <div key={org.id}>
                {/* Section header shows org name only per D-05 */}
                <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-tight mb-6 mt-14 first:mt-0 border-b-2 border-accent pb-3">
                  {org.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orgOfficials.map((official) => {
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
                          <div className="relative w-20 h-20 overflow-hidden mb-4">
                            <Image
                              src={photo.url}
                              alt={`${official.name}, ${official.role}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <h3 className="text-xl font-heading font-bold truncate">
                          {official.name}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 truncate">
                          {official.role}
                        </p>
                        <div className="flex flex-col gap-2">
                          {official.email && (
                            <a
                              href={`mailto:${official.email}`}
                              className="flex items-center gap-2 text-accent hover:underline text-sm min-h-[44px] py-1 break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                            >
                              <Mail
                                className="w-4 h-4 flex-shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {official.email}
                              </span>
                            </a>
                          )}
                          {official.phone && (
                            <a
                              href={`tel:${official.phone}`}
                              className="flex items-center gap-2 text-accent hover:underline text-sm min-h-[44px] py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                            >
                              <Phone
                                className="w-4 h-4 flex-shrink-0"
                                aria-hidden="true"
                              />
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
        </div>
      ))}
    </Section>
  )
}
