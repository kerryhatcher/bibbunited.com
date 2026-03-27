import React from 'react'
import type { Metadata } from 'next'
import { Barlow_Condensed, Source_Serif_4 } from 'next/font/google'
import { getThemeMode } from '@/lib/getTheme'
import { getNavigation } from '@/lib/getNavigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { UrgentBannerBar } from '@/components/layout/UrgentBannerBar'
import './styles.css'

const barlowCondensed = Barlow_Condensed({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://www.bibbunited.com'),
    title: {
      default: 'BIBB United',
      template: '%s | BIBB United',
    },
    description:
      'Civic advocacy for the BIBB community -- informing and activating residents on local school system issues.',
    openGraph: {
      type: 'website',
      siteName: 'BIBB United',
      images: [{ url: '/og-default.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-default.png'],
    },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const mode = await getThemeMode()
  const navigation = await getNavigation()

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${sourceSerif.variable}`}>
      <body data-mode={mode}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-accent focus:text-text-on-accent focus:px-4 focus:py-2 focus:font-heading focus:font-bold focus:uppercase focus:tracking-wide focus:transition-transform focus:duration-200"
        >
          Skip to main content
        </a>
        <UrgentBannerBar />
        <Header navItems={navigation.items || []} />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
