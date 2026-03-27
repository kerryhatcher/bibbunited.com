import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface CardProps {
  imageSrc?: string
  imageAlt?: string
  children: React.ReactNode
  className?: string
  href?: string
}

export function Card({
  imageSrc,
  imageAlt = '',
  children,
  className = '',
  href,
}: CardProps) {
  const cardClasses = `border border-border bg-bg-dominant overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg ${className}`

  const content = (
    <>
      {imageSrc && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">{children}</div>
    </>
  )

  if (href) {
    const isInternal = href.startsWith('/')
    const Wrapper = isInternal ? Link : 'a'
    return (
      <Wrapper
        href={href}
        className={`block ${cardClasses} focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
        {...(!isInternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
        {!isInternal && <span className="sr-only"> (opens in new tab)</span>}
      </Wrapper>
    )
  }

  return <article className={cardClasses}>{content}</article>
}
