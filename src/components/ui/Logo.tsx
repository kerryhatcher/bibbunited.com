import React from 'react'

interface LogoProps {
  className?: string
  size?: 'default' | 'large'
}

export function Logo({ className = '', size = 'default' }: LogoProps) {
  const textSize = size === 'large' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'

  return (
    <span
      className={`inline-flex font-heading font-bold uppercase tracking-tight ${textSize} ${className}`}
      role="img"
      aria-label="BIBB United"
    >
      <span className="logo-bibb">BIBB</span>
      <span className="text-crimson ml-2">UNITED</span>
    </span>
  )
}
