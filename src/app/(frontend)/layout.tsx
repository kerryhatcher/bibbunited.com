import React from 'react'
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

export const metadata = {
  description: 'BIBB United - Civic advocacy for the BIBB community',
  title: 'BIBB United',
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
