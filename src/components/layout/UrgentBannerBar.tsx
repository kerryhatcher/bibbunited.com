import React from 'react'
import Link from 'next/link'
import { getUrgentBanner } from '@/lib/getUrgentBanner'

export async function UrgentBannerBar() {
  const banner = await getUrgentBanner()

  if (!banner?.active) {
    return null
  }

  return (
    <div
      data-print-hide=""
      role="alert"
      className="z-40 bg-crimson py-3 px-4 text-center font-heading font-bold text-white uppercase tracking-wide"
    >
      <span className="inline-flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping bg-white opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 bg-white" />
        </span>
        {banner.link ? (
          banner.link.startsWith('/') ? (
            <Link href={banner.link} className="underline hover:no-underline">
              {banner.message}
            </Link>
          ) : (
            <a href={banner.link} className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
              {banner.message}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          )
        ) : (
          <span>{banner.message}</span>
        )}
      </span>
    </div>
  )
}
