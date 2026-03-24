import React from 'react'
import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body data-mode={mode}>
        <UrgentBannerBar />
        <Header navItems={navigation.items || []} />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
