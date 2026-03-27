import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generatePageMeta } from '@/lib/metadata'
import { Section } from '@/components/ui/Section'
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { JsonLdScript, breadcrumbJsonLd } from '@/lib/jsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMeta({
    title: 'Meeting Schedule',
    description:
      'Upcoming school board and public meeting dates, times, and locations.',
    slug: 'meetings',
  })
}

export default async function MeetingsPage() {
  const payload = await getPayload({ config: configPromise })
  const meetings = await payload.find({
    collection: 'meetings',
    limit: 100,
    sort: 'date',
  })

  const upcoming = meetings.docs.filter(
    (m) => !isPast(new Date(m.date as string)),
  )
  const past = meetings.docs
    .filter((m) => isPast(new Date(m.date as string)))
    .reverse()

  return (
    <Section>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: 'Home', url: 'https://www.bibbunited.com' },
          {
            name: 'Meeting Schedule',
            url: 'https://www.bibbunited.com/meetings',
          },
        ])}
      />
      <h1 className="text-4xl sm:text-5xl font-heading font-bold uppercase tracking-tight mb-4">
        Meeting Schedule
      </h1>
      <p className="text-text-secondary text-lg mb-12 max-w-[65ch]">
        Show up. Be heard. Public meetings are where decisions get made.
      </p>

      {/* Upcoming meetings */}
      <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-tight mb-6 border-b-2 border-accent pb-3">
        Upcoming Meetings
      </h2>

      {upcoming.length === 0 && (
        <div className="text-center py-12 border border-border bg-bg-dominant mb-8">
          <Calendar className="mx-auto h-12 w-12 text-text-secondary mb-4" />
          <h2 className="text-2xl font-heading font-bold uppercase mb-4">
            No Upcoming Meetings Scheduled
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Check back soon for the latest meeting dates and locations.
            Want to stay informed? Reach out and let us know.
          </p>
          <Button href="/about">Get in Touch</Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
      {upcoming.map((meeting) => (
        <div
          key={meeting.id}
          className="border border-border border-l-4 border-l-accent p-6 bg-bg-dominant"
        >
          <h3 className="text-xl font-heading font-bold mb-3">
            {meeting.title}
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 text-text-secondary">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {meeting.time}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {meeting.location}
            </span>
          </div>
          {meeting.agendaLink && (
            <a
              href={meeting.agendaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:underline mt-3 min-h-[44px] py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ExternalLink className="w-4 h-4" />
              View Agenda
            </a>
          )}
          {meeting.notes && (
            <p className="text-text-secondary text-sm mt-3 italic">
              {meeting.notes}
            </p>
          )}
        </div>
      ))}
      </div>

      {/* Past meetings (collapsible) */}
      {past.length > 0 && (
        <details className="mt-12">
          <summary className="text-2xl font-heading font-bold uppercase tracking-tight cursor-pointer hover:text-accent transition-colors">
            Past Meetings ({past.length})
          </summary>

          <div className="mt-6 flex flex-col gap-4">
            {past.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-border p-6 bg-bg-dominant text-text-secondary"
              >
                <h3 className="text-xl font-heading font-bold mb-3">
                  {meeting.title}
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 text-text-secondary">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {meeting.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {meeting.location}
                  </span>
                </div>
                {meeting.agendaLink && (
                  <a
                    href={meeting.agendaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline mt-3 min-h-[44px] py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agenda
                  </a>
                )}
                {meeting.notes && (
                  <p className="text-text-secondary text-sm mt-3 italic">
                    {meeting.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </Section>
  )
}
