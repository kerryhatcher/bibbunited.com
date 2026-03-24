import React from 'react'

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
    'inline-flex items-center justify-center font-heading font-bold uppercase tracking-wide px-6 min-h-[44px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-text-on-accent hover:brightness-90',
    secondary:
      'border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-text-on-accent',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    return (
      <a href={href} className={classes}>
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
