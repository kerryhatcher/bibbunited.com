import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dark'
  divider?: boolean
}

export function Section({
  children,
  className = '',
  variant = 'default',
  divider = true,
}: SectionProps) {
  const bg = variant === 'dark' ? 'bg-bg-secondary' : ''
  const text = variant === 'dark' ? 'text-text-on-dark' : ''
  const border = divider ? 'border-t border-border' : ''

  return (
    <section
      className={`py-[clamp(2rem,4vw,3rem)] px-[clamp(1rem,3vw,2rem)] ${bg} ${text} ${border} ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  )
}
