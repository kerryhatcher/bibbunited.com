import React from 'react'

interface SectionProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dark'
  spacing?: 'compact' | 'default' | 'generous'
}

const spacingClasses = {
  compact: 'py-6 sm:py-8',
  default: 'py-10 sm:py-14',
  generous: 'py-14 sm:py-20',
}

export function Section({
  children,
  className = '',
  variant = 'default',
  spacing = 'default',
}: SectionProps) {
  const bg = variant === 'dark' ? 'bg-bg-secondary' : ''
  const text = variant === 'dark' ? 'text-text-on-dark' : ''

  return (
    <section
      className={`${spacingClasses[spacing]} px-4 sm:px-6 lg:px-8 ${bg} ${text} ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  )
}
