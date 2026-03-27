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
  ArrowRight,
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
      <h2 className="text-fluid-section-title font-heading font-bold uppercase tracking-tight mb-8 section-heading-rule">
        Key Issues
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Featured first callout -- spans 2 columns, full crimson treatment */}
        {featured && (() => {
          const IconComponent = (featured.icon && iconMap[featured.icon]) || FileText
          return (
            <Link
              href={`/${featured.link.slug}`}
              className="group block sm:col-span-2 bg-accent p-8 sm:p-10 hover:bg-accent/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <IconComponent className="w-9 h-9 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-2xl sm:text-3xl font-heading font-bold uppercase text-white">
                {featured.title}
              </h3>
              <p className="mt-3 text-white/90 text-base">{featured.blurb}</p>
            </Link>
          )
        })()}

        {/* Remaining callouts -- crimson icon badges, always-visible border */}
        {rest.map((callout, index) => {
          const IconComponent = (callout.icon && iconMap[callout.icon]) || FileText
          return (
            <Link
              key={index}
              href={`/${callout.link.slug}`}
              className="group block border-l-4 border-l-accent border border-border bg-bg-secondary/50 p-6 hover:bg-bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-text-on-dark/50 group-hover:text-accent group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-heading font-bold uppercase">
                {callout.title}
              </h3>
              <p className="mt-2 text-text-on-dark/80 text-sm">{callout.blurb}</p>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
