import React from 'react'
import { getUrgentBanner } from '@/lib/getUrgentBanner'

export async function UrgentBannerBar() {
  const banner = await getUrgentBanner()

  if (!banner?.active) {
    return null
  }

  return (
    <div
      data-print-hide=""
      className="z-40 bg-crimson py-2 px-4 text-center text-sm font-bold text-white"
    >
      {banner.link ? (
        <a href={banner.link} className="underline hover:no-underline">
          {banner.message}
        </a>
      ) : (
        <p className="m-0">{banner.message}</p>
      )}
    </div>
  )
}
