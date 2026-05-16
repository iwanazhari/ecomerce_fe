'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn, getImageUrl } from '@/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
  isPrimary: boolean
}

interface ImageGalleryProps {
  images: ProductImage[]
  productName: string
  aspect?: 'square' | 'wide'
  showThumbnails?: boolean
}

export function ImageGallery({
  images,
  productName,
  aspect = 'square',
  showThumbnails = true,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-background text-6xl font-light text-foreground-subtle',
        aspect === 'wide' ? 'aspect-video' : 'aspect-square',
      )}>
        {productName.charAt(0)}
      </div>
    )
  }

  const currentImage = images[currentIndex]
  const aspectClass = aspect === 'wide' ? 'aspect-video' : 'aspect-square'

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="group">
      {/* Main Image */}
      <div className={cn('relative overflow-hidden rounded-xl border border-border bg-background', aspectClass)}>
        <Image
          src={getImageUrl(currentImage.url)}
          alt={currentImage.alt || productName}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
              aria-label="Next image"
            >
              <ChevronRight className="size-5 text-foreground" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                index === currentIndex
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100',
              )}
              style={{ width: '64px', height: '64px' }}
            >
              <Image
                src={getImageUrl(image.url)}
                alt={image.alt || productName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
