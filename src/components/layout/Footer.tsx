import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

export function Footer() {
  return (
    <footer data-print-hide="" className="bg-navy text-text-on-dark">
      {/* Get Involved CTA section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            GET INVOLVED
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-on-dark">
            Your voice matters. Here&apos;s how you can make a difference.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/contact-officials">Contact Officials</Button>
            <Button href="/meetings" variant="secondary">
              Upcoming Meetings
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
          {/* Left: logo + copyright */}
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-sm text-text-on-dark">
              &copy; 2026 BIBB United. All rights reserved.
            </span>
          </div>

          {/* Right: quick links */}
          <nav aria-label="Footer navigation">
            <ul className="m-0 flex list-none items-center gap-6 p-0">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-on-dark no-underline hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-sm text-text-on-dark no-underline hover:text-white"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-officials"
                  className="text-sm text-text-on-dark no-underline hover:text-white"
                >
                  Contact Officials
                </Link>
              </li>
              <li>
                <Link
                  href="/meetings"
                  className="text-sm text-text-on-dark no-underline hover:text-white"
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
