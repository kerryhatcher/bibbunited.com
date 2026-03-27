'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { formatArticleDate } from '@/components/shared/DateDisplay'

interface HeroStory {
  title: string
  slug: string
  featuredImage: { url: string; alt?: string }
  publishDate: string
}

interface HeroSpotlightProps {
  stories: HeroStory[]
}

export function HeroSpotlight({ stories }: HeroSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length)
  }, [stories.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }, [stories.length])

  useEffect(() => {
    if (isPaused || stories.length <= 1) return

    const interval = setInterval(goToNext, 7000)
    return () => clearInterval(interval)
  }, [isPaused, goToNext, stories.length])

  if (!stories || stories.length === 0) {
    return (
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] overflow-hidden bg-bg-secondary" />
    )
  }

  const showControls = stories.length > 1

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured stories"
      className="relative w-full aspect-[16/7] sm:aspect-[16/6] overflow-hidden bg-bg-secondary"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {stories.map((story, index) => (
          <div
            key={story.slug}
            id={`hero-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`hero-tab-${index}`}
            aria-hidden={index !== currentIndex}
            className="min-w-full relative h-full"
          >
            <Image
              src={story.featuredImage.url}
              alt={story.featuredImage.alt || story.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 sm:p-10 sm:pb-10 text-white">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-bold uppercase tracking-tight mb-2 line-clamp-3">
                <Link
                  href={`/news/${story.slug}`}
                  className="hover:underline focus:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                >
                  {story.title}
                </Link>
              </h2>
              {story.publishDate && (
                <p className="text-white/80 text-sm" suppressHydrationWarning>
                  {formatArticleDate(story.publishDate)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows + pause/play */}
      {showControls && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-[var(--color-overlay)] hover:bg-black/70 text-white rounded-full p-3 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-[var(--color-overlay)] hover:bg-black/70 text-white rounded-full p-3 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            aria-label="Next story"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="absolute top-4 right-4 bg-[var(--color-overlay)] hover:bg-black/70 text-white rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
            aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </>
      )}

      {/* Live region for screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Story ${currentIndex + 1} of ${stories.length}: ${stories[currentIndex]?.title}`}
      </div>

      {/* Dot indicators */}
      {showControls && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" role="tablist" aria-label="Story slides">
          {stories.map((_, index) => (
            <button
              key={index}
              id={`hero-tab-${index}`}
              role="tab"
              tabIndex={index === currentIndex ? 0 : -1}
              aria-selected={index === currentIndex}
              aria-controls={`hero-panel-${index}`}
              onClick={() => setCurrentIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  const next = (index + 1) % stories.length
                  setCurrentIndex(next)
                  document.getElementById(`hero-tab-${next}`)?.focus()
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  const prev = (index - 1 + stories.length) % stories.length
                  setCurrentIndex(prev)
                  document.getElementById(`hero-tab-${prev}`)?.focus()
                } else if (e.key === 'Home') {
                  e.preventDefault()
                  setCurrentIndex(0)
                  document.getElementById('hero-tab-0')?.focus()
                } else if (e.key === 'End') {
                  e.preventDefault()
                  const last = stories.length - 1
                  setCurrentIndex(last)
                  document.getElementById(`hero-tab-${last}`)?.focus()
                }
              }}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
              aria-label={`Go to story ${index + 1} of ${stories.length}`}
            >
              <span className={`block w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
