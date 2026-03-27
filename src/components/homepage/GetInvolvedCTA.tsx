'use client'

import { usePathname } from 'next/navigation'
import { ChevronsDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CTA_LINKS } from '@/lib/ctaLinks'

export function GetInvolvedCTA() {
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const visible = CTA_LINKS.filter((link) => normalizedPath !== link.href)

  if (visible.length === 0) return null

  return (
    <section
      aria-labelledby="get-involved-heading"
      className="bg-bg-secondary text-text-on-dark px-[clamp(1rem,3vw,2rem)] pt-4 pb-2 sm:pt-6 sm:pb-3"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id="get-involved-heading"
          className="text-fluid-cta-hero font-heading font-bold uppercase tracking-tight leading-none text-white"
        >
          Get Involved
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-body text-2xl text-white/90 sm:text-3xl lg:text-4xl">
          They make decisions. You make the difference.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {visible.map((link) => (
            <Button
              key={link.href}
              href={link.href}
              variant={link.variant}
              className={
                link.variant === 'primary'
                  ? 'text-lg px-10 py-4 sm:text-xl sm:px-14 sm:py-5'
                  : 'text-lg px-10 py-4 sm:text-xl sm:px-14 sm:py-5 text-white border-white hover:bg-white hover:text-navy focus:ring-offset-bg-secondary'
              }
            >
              {link.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Scroll hint chevron */}
      <div className="mt-6 flex justify-center" aria-hidden="true">
        <ChevronsDown className="h-6 w-6 text-accent animate-bounce" />
      </div>
    </section>
  )
}
