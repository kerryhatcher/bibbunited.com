'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
          <div key={index} className="min-w-full relative h-full">
            <img
              src={story.featuredImage.url}
              alt={story.featuredImage.alt || story.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-bold uppercase tracking-tight mb-2">
                <a
                  href={`/news/${story.slug}`}
                  className="hover:underline focus:underline focus:outline-none"
                >
                  {story.title}
                </a>
              </h2>
              {story.publishDate && (
                <p className="text-white/80 text-sm">
                  {formatArticleDate(story.publishDate)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showControls && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next story"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {stories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to story ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
