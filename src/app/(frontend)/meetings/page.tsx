import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Section } from '@/components/ui/Section'
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { JsonLdScript, breadcrumbJsonLd } from '@/lib/jsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Meeting Schedule',
    description:
      'Upcoming school board and public meeting dates, times, and locations.',
    openGraph: {
      title: 'Meeting Schedule | BIBB United',
      description:
        'Upcoming school board and public meeting dates, times, and locations.',
    },
  }
}

export default async function MeetingsPage() {
  const payload = await getPayload({ config: configPromise })
  const meetings = await payload.find({
    collection: 'meetings',
    limit: 100,
    sort: 'date',
  })

  const now = new Date()
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
      <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-tight mb-6">
        Upcoming Meetings
      </h2>

      {upcoming.length === 0 && (
        <p className="text-text-secondary mb-8">
          No upcoming meetings scheduled. Check back soon.
        </p>
      )}

      {upcoming.map((meeting) => (
        <div
          key={meeting.id}
          className="border border-border p-6 bg-bg-dominant mb-4"
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
              className="inline-flex items-center gap-1 text-accent hover:underline mt-3"
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

      {/* Past meetings (collapsible) */}
      {past.length > 0 && (
        <details className="mt-12">
          <summary className="text-2xl font-heading font-bold uppercase tracking-tight cursor-pointer hover:text-accent">
            Past Meetings ({past.length})
          </summary>

          <div className="mt-6">
            {past.map((meeting) => (
              <div
                key={meeting.id}
                className="border border-border p-6 bg-bg-dominant mb-4 opacity-75"
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
                    className="inline-flex items-center gap-1 text-accent hover:underline mt-3"
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
