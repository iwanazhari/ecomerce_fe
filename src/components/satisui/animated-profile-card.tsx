'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardContent, CardFooter, CardHeader } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { useRef } from 'react'

export interface SocialLink {
  id: string
  url: string
  icon: React.ReactNode
  label: string
}

export interface ProfileCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  location: string
  bio: string
  avatarSrc: string
  avatarFallback: string
  variant?: 'default' | 'on-accent'
  socials?: SocialLink[]
  showAvatar?: boolean
  titleStyle?: React.CSSProperties
  cardStyle?: React.CSSProperties
  descriptionClassName?: string
  bioClassName?: string
  footerClassName?: string
}

/**
 * A presentational component that displays the content of a user profile card.
 * Designed to be composed within other components, such as an animation container.
 */
export const ProfileCardContent = React.forwardRef<
  HTMLDivElement,
  ProfileCardContentProps
>(
  (
    {
      className,
      name,
      location,
      bio,
      avatarSrc,
      avatarFallback,
      variant = 'default',
      socials = [],
      showAvatar = true,
      titleStyle,
      cardStyle,
      descriptionClassName,
      bioClassName,
      footerClassName,
      ...props
    },
    ref
  ) => {
    const isOnAccent = variant === 'on-accent'

    return (
      <div
        ref={ref}
        className={cn(
          'w-full h-full p-8 flex flex-col rounded-xl border-0',
          isOnAccent
            ? 'text-[var(--on-accent-foreground)]'
            : 'bg-surface text-foreground',
          className
        )}
        style={cardStyle}
        {...props}
      >
        <CardHeader className="p-0">
          <div className={cn('flex-shrink-0', !showAvatar && 'invisible')}>
            <Avatar className="h-16 w-16 ring-2 ring-offset-4 ring-offset-background">
              <AvatarImage src={avatarSrc} alt={name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </div>
          <p
            className={cn(
              'pt-6 text-left text-sm text-foreground-muted',
              descriptionClassName
            )}
          >
            {location}
          </p>
          <span
            className={cn('text-3xl text-left font-semibold', className)}
            style={{
              ...(isOnAccent ? { color: 'var(--on-accent-foreground)' } : {}),
              ...titleStyle,
            }}
          >
            {name}
          </span>
        </CardHeader>

        <CardContent className="p-0 flex-grow mt-6">
          <p
            className={cn(
              'text-base leading-relaxed text-left text-foreground-muted',
              bioClassName
            )}
          >
            {bio}
          </p>
        </CardContent>

        {socials.length > 0 && (
          <CardFooter className={cn('p-0 mt-6', footerClassName)}>
            <div
              className={cn(
                'flex items-center gap-4 text-foreground-muted',
              )}
            >
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:text-foreground"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </CardFooter>
        )}
      </div>
    )
  }
)
ProfileCardContent.displayName = 'ProfileCardContent'

export interface AnimatedProfileCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  baseCard: React.ReactNode
  overlayCard: React.ReactNode
  accentColor?: string
  onAccentForegroundColor?: string
  onAccentMutedForegroundColor?: string
}

/**
 * A container component that creates a circular reveal animation on hover.
 * It composes two child components, a `baseCard` and an `overlayCard`,
 * to create the effect.
 */
export const AnimatedProfileCard = React.forwardRef<
  HTMLDivElement,
  AnimatedProfileCardProps
>(
  (
    {
      className,
      accentColor = 'var(--primary)',
      onAccentForegroundColor = '#ffffff',
      onAccentMutedForegroundColor = 'rgba(255, 255, 255, 0.8)',
      baseCard,
      overlayCard,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const { resolvedTheme } = useTheme()
    const overlayThemeClass = resolvedTheme === 'dark' ? 'light' : 'dark'

    const setContainerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [ref]
    )

    const initialClipPath = 'circle(40px at 64px 64px)'
    const hoverClipPath = 'circle(150% at 64px 64px)'

    useGSAP(
      () => {
        gsap.set(overlayRef.current, { clipPath: initialClipPath })
      },
      { scope: containerRef }
    )

    const handleMouseEnter = () => {
      gsap.killTweensOf(overlayRef.current)
      gsap.to(overlayRef.current, {
        clipPath: hoverClipPath,
        duration: 0.7,
        ease: 'expo.inOut',
      })
    }
    const handleMouseLeave = () => {
      gsap.killTweensOf(overlayRef.current)
      gsap.to(overlayRef.current, {
        clipPath: initialClipPath,
        duration: 1.2,
        ease: 'expo.out',
      })
    }

    return (
      <div
        ref={setContainerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={
          {
            '--accent-color': accentColor,
            '--on-accent-foreground': onAccentForegroundColor,
            '--on-accent-muted-foreground': onAccentMutedForegroundColor,
            borderColor: 'var(--accent-color)',
          } as React.CSSProperties
        }
        className={cn(
          'relative h-fit w-[350px] overflow-hidden rounded-xl border-2',
          className
        )}
        {...props}
      >
        <div className="h-full w-full">{baseCard}</div>
        <div
          ref={overlayRef}
          className={cn('absolute inset-0 h-full w-full', overlayThemeClass)}
        >
          {overlayCard}
        </div>
      </div>
    )
  }
)
AnimatedProfileCard.displayName = 'AnimatedProfileCard'
