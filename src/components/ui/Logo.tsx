import React from 'react'

interface LogoProps {
  className?: string
  size?: 'default' | 'large'
  variant?: 'default' | 'footer'
}

export function Logo({ className = '', size = 'default', variant = 'default' }: LogoProps) {
  const textSize = size === 'large' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
  const bibbColor = variant === 'footer' ? 'text-accent' : 'logo-bibb'
  const unitedColor = variant === 'footer' ? 'text-white' : 'text-accent'

  return (
    <span
      className={`inline-flex font-heading font-bold uppercase tracking-tight ${textSize} ${className}`}
      aria-label="BIBB United"
    >
      <span className={bibbColor} aria-hidden="true">BIBB</span>
      <span className={`${unitedColor} ml-2`} aria-hidden="true">UNITED</span>
    </span>
  )
}
