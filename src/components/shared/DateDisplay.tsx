import React from 'react'
import { format } from 'date-fns'

interface DateDisplayProps {
  publishDate?: string | null
  updatedAt?: string | null
  variant?: 'full' | 'compact'
}

export function formatArticleDate(dateString: string): string {
  return format(new Date(dateString), 'MMMM d, yyyy')
}

export function DateDisplay({
  publishDate,
  updatedAt,
  variant = 'full',
}: DateDisplayProps) {
  if (!publishDate && !updatedAt) return null

  const dateStr = publishDate || updatedAt
  if (!dateStr) return null

  const formatted = formatArticleDate(dateStr)

  if (variant === 'compact') {
    return (
      <time dateTime={dateStr} className="text-text-secondary text-sm">
        {formatted}
      </time>
    )
  }

  return (
    <div className="text-text-secondary text-sm">
      <time dateTime={dateStr}>Published {formatted}</time>
      {updatedAt && publishDate && updatedAt !== publishDate && (
        <span className="ml-2">(Updated {formatArticleDate(updatedAt)})</span>
      )}
    </div>
  )
}
