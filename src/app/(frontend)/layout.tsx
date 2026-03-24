import React from 'react'
import './styles.css'

export const metadata = {
  description: 'BIBB United - Civic advocacy for the BIBB community',
  title: 'BIBB United',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
