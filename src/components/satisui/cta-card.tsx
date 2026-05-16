'use client'

import { cn } from '@/lib/utils'
import { Button, Input, Label } from '@/components/ui'
import Image from 'next/image'
import { useState } from 'react'

interface CTACardProps {
  /** The main headline or title for the CTA. */
  title: string
  /** A short description supporting the title. */
  description: string
  /** The source URL for the image. */
  imageSrc: string
  /** Alt text for the image, for accessibility. */
  imageAlt?: string
  /** Placeholder text for the email input field. */
  inputPlaceholder?: string
  /** Text displayed on the submission button. */
  buttonText?: string
  /** Callback function executed when the form is submitted. */
  onSubmit: (email: string) => void
  /** Optional additional class names to apply to the root card element for custom styling. */
  className?: string
}

/**
 * A responsive Call-to-Action (CTA) card component.
 * It displays an image alongside a title, description, and an email subscription form.
 * Designed to be theme-aware and fully customizable through props.
 */
export function CTACard({
  title,
  description,
  imageSrc,
  imageAlt = 'Gambar promosi',
  inputPlaceholder = 'nama@email.com',
  buttonText = 'Berlangganan',
  onSubmit,
  className,
}: CTACardProps) {
  const [email, setEmail] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(email)
    setEmail('')
  }

  return (
    <div
      className={cn(
        'w-full max-w-4xl overflow-hidden p-3 border border-border rounded-xl bg-surface',
        className
      )}
    >
      {/*
        DECISION: A 16-column grid is used on desktop to allow for fine-grained,
        asymmetrical layouts (e.g., the 7/9 split used here) that a standard
        12-column grid might not accommodate as cleanly.
      */}
      <div className="grid grid-cols-1 md:grid-cols-16 gap-3">
        <div className="relative h-64 md:h-auto rounded-lg md:col-span-7 overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>

        <div className="flex flex-col w-full justify-start items-start rounded-lg border border-border p-6 md:p-8 gap-6 md:gap-10 bg-surface-hover">
          <div className="w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Label className="text-foreground-muted text-sm">{description}</Label>
            <form
              onSubmit={handleSubmit}
              className="mt-1 flex w-full flex-col sm:flex-row gap-2"
            >
              <Input
                type="email"
                placeholder={inputPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                aria-label="Email untuk newsletter"
                required
              />
              <Button type="submit" variant="primary" size="md">
                {buttonText}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
