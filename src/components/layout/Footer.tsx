import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { FooterCTA } from '@/components/layout/FooterCTA'

export function Footer() {
  return (
    <footer data-print-hide="" className="bg-navy text-white">
      {/* Get Involved CTA section */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FooterCTA />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
          {/* Left: logo + copyright */}
          <div className="flex items-center gap-3">
            <Logo variant="footer" />
            <span className="text-sm text-white/80">
              &copy; 2026 BIBB United. All rights reserved.
            </span>
          </div>

          {/* Right: quick links */}
          <nav aria-label="Footer navigation">
            <ul role="list" className="m-0 flex list-none items-center gap-6 p-0">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/80 no-underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-sm text-white/80 no-underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-officials"
                  className="text-sm text-white/80 no-underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Contact Officials
                </Link>
              </li>
              <li>
                <Link
                  href="/meetings"
                  className="text-sm text-white/80 no-underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Meetings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
