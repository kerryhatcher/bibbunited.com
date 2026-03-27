import React from 'react'
import Link from 'next/link'
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

  const [featured, ...rest] = callouts

  return (
    <Section variant="dark">
      <h2 className="text-fluid-section-title font-heading font-bold uppercase tracking-tight mb-8">
        Key Issues
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Featured first callout -- spans 2 columns on lg */}
        {featured && (() => {
          const IconComponent = (featured.icon && iconMap[featured.icon]) || FileText
          return (
            <Link
              href={`/${featured.link.slug}`}
              className="block sm:col-span-2 border-l-4 border-l-accent border border-border bg-bg-secondary/50 p-8 hover:bg-bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
            >
              <IconComponent className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-3">
                {featured.title}
              </h3>
              <p className="text-text-on-dark text-base">{featured.blurb}</p>
            </Link>
          )
        })()}

        {/* Remaining callouts */}
        {rest.map((callout, index) => {
          const IconComponent = (callout.icon && iconMap[callout.icon]) || FileText
          return (
            <Link
              key={index}
              href={`/${callout.link.slug}`}
              className="block border-l-4 border-l-transparent border border-border bg-bg-secondary/50 p-6 hover:border-l-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
            >
              <IconComponent className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-heading font-bold uppercase mb-2">
                {callout.title}
              </h3>
              <p className="text-text-on-dark text-sm">{callout.blurb}</p>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
