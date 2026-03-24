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
    <Section variant="dark">
      <h2 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-tight mb-8">
        Key Issues
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {callouts.map((callout, index) => {
          const IconComponent = (callout.icon && iconMap[callout.icon]) || FileText
          return (
            <a
              key={index}
              href={`/${callout.link.slug}`}
              className="block bg-bg-secondary/50 border border-border p-6 hover:border-accent transition-colors"
            >
              <IconComponent className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-heading font-bold uppercase mb-2">
                {callout.title}
              </h3>
              <p className="text-text-on-dark text-sm">{callout.blurb}</p>
            </a>
          )
        })}
      </div>
    </Section>
  )
}
