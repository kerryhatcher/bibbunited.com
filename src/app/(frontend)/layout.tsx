import React from 'react'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { getThemeMode } from '@/lib/getTheme'
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

  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body data-mode={mode}>
        <main>{children}</main>
      </body>
    </html>
  )
}
