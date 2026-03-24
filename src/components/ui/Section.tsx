import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dark'
}

export function Section({
  children,
  className = '',
  variant = 'default',
}: SectionProps) {
  const bg = variant === 'dark' ? 'bg-bg-secondary' : ''
  const text = variant === 'dark' ? 'text-text-on-dark' : ''

  return (
    <section
      className={`py-8 sm:py-12 px-4 sm:px-6 lg:px-8 ${bg} ${text} ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  )
}
