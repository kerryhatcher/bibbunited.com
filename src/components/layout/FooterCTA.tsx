'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface CTALink {
  href: string
  label: string
  variant: 'primary' | 'secondary'
}

const CTA_LINKS: CTALink[] = [
  { href: '/contact-officials', label: 'Contact Officials', variant: 'primary' },
  { href: '/meetings', label: 'Upcoming Meetings', variant: 'secondary' },
]

export function FooterCTA() {
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const visible = CTA_LINKS.filter(
    (link) => normalizedPath !== link.href,
  )

  if (visible.length === 0) return null

  return (
    <div className="text-center">
      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
        GET INVOLVED
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
        Your voice matters. Here&apos;s how you can make a difference.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {visible.map((link) => (
          <Button
            key={link.href}
            href={link.href}
            variant={link.variant}
            className="focus:ring-offset-navy"
          >
            {link.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
