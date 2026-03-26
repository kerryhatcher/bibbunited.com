import React from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  href?: string
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  href,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-heading text-sm font-bold uppercase tracking-wide px-6 min-h-[44px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98]'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-text-on-accent hover:brightness-90',
    secondary:
      'border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-text-on-accent',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    const isInternal = href.startsWith('/')
    if (isInternal) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
