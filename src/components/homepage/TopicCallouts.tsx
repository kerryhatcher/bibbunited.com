import React from 'react'
import {
  Calendar,
  Users,
  DollarSign,
  Building,
  FileText,
  Phone,
  MapPin,
  AlertTriangle,
  BookOpen,
  Megaphone,
} from 'lucide-react'
import { Section } from '@/components/ui/Section'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  users: Users,
  'dollar-sign': DollarSign,
  building: Building,
  'file-text': FileText,
  phone: Phone,
  'map-pin': MapPin,
  'alert-triangle': AlertTriangle,
  'book-open': BookOpen,
  megaphone: Megaphone,
}

interface TopicCallout {
  title: string
  blurb: string
  icon?: string
  link: { slug: string }
}

interface TopicCalloutsProps {
  callouts: TopicCallout[]
}

export function TopicCallouts({ callouts }: TopicCalloutsProps) {
  if (!callouts || callouts.length === 0) return null

  return (
    <Section variant="dark" spacing="generous">
      <h2 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-tight mb-8">
        Key Issues
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {callouts.map((callout, index) => {
          const IconComponent = (callout.icon && iconMap[callout.icon]) || FileText
          return (
            <a
              key={callout.link.slug || index}
              href={`/${callout.link.slug}`}
              className="block no-underline bg-bg-secondary/50 border border-border p-6 hover:border-accent transition-all duration-200 hover:bg-bg-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
            >
              <IconComponent className="w-10 h-10 text-accent mb-4 flex-shrink-0" aria-hidden="true" />
              <h3 className="text-xl font-heading font-bold uppercase mb-2 line-clamp-2">
                {callout.title}
              </h3>
              <p className="text-text-on-dark text-sm line-clamp-3">{callout.blurb}</p>
            </a>
          )
        })}
      </div>
    </Section>
  )
}
