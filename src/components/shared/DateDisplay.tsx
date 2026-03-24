'use client'

import React, { useState, useEffect } from 'react'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'

export function formatArticleDate(dateString: string): string {
  const date = new Date(dateString)
  const daysAgo = differenceInDays(new Date(), date)
  if (daysAgo < 7) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  return format(date, 'MMMM d, yyyy')
}

interface DateDisplayProps {
  publishDate: string
  updatedAt?: string
  variant?: 'full' | 'compact'
}

export function DateDisplay({
  publishDate,
  updatedAt,
  variant = 'full',
}: DateDisplayProps) {
  const [formattedPublish, setFormattedPublish] = useState(() =>
    format(new Date(publishDate), 'MMMM d, yyyy'),
  )
  const [formattedUpdate, setFormattedUpdate] = useState<string | null>(null)

  useEffect(() => {
    if (variant === 'compact') {
      setFormattedPublish(formatArticleDate(publishDate))
    } else {
      setFormattedPublish(format(new Date(publishDate), 'MMMM d, yyyy'))

      if (updatedAt) {
        const publishD = new Date(publishDate)
        const updateD = new Date(updatedAt)
        const daysDiff = differenceInDays(updateD, publishD)
        if (daysDiff > 1) {
          setFormattedUpdate(format(updateD, 'MMMM d, yyyy'))
        }
      }
    }
  }, [publishDate, updatedAt, variant])

  if (variant === 'compact') {
    return (
      <time
        dateTime={publishDate}
        className="text-text-secondary text-sm"
        suppressHydrationWarning
      >
        {formattedPublish}
      </time>
    )
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-secondary text-sm">
      <time dateTime={publishDate} suppressHydrationWarning>
        Published: {formattedPublish}
      </time>
      {formattedUpdate && (
        <time dateTime={updatedAt} suppressHydrationWarning>
          Updated: {formattedUpdate}
        </time>
      )}
    </div>
  )
}
