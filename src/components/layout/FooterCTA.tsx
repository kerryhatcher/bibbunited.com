'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CTA_LINKS } from '@/lib/ctaLinks'

export function FooterCTA() {
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const visible = CTA_LINKS.filter(
    (link) => normalizedPath !== link.href,
  )

  if (visible.length === 0) return null

  return (
    <div className="text-center">
      <h2 className="font-heading text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl">
        GET INVOLVED
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-xl text-white/80 sm:text-2xl">
        They make decisions. You make the difference.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {visible.map((link) => (
          <Button
            key={link.href}
            href={link.href}
            variant={link.variant}
            className={`focus:ring-offset-navy ${link.variant === 'secondary' ? 'text-white border-white hover:bg-white hover:text-navy' : ''}`}
          >
            {link.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
