'use client'

import { Badge } from '@/components/ui'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui'
import { cn, formatPostDate, formatReadTime } from '@/lib/utils'
import Image from 'next/image'

interface BlogCardProps {
  /** The main title of the blog post. */
  title: string
  /** A short summary or excerpt from the blog post. */
  description: string
  /** The URL for the main image of the post. */
  imageUrl?: string
  /** The category or tag associated with the post. */
  category?: string
  /** The estimated reading time in seconds. */
  readTime?: number
  /** The name of the post's author. */
  author?: string
  /** The publication date of the post. */
  date?: Date
  /** The number of lines to truncate the description to before showing an ellipsis. */
  truncateLines?: number
}

/**
 * A reusable card component for displaying a summary of a blog post.
 * It's designed to be flexible, showing or hiding elements based on the provided props.
 */
export const BlogCard: React.FC<BlogCardProps> = ({
  imageUrl,
  category,
  readTime,
  title,
  description,
  author,
  date,
  truncateLines,
}) => {
  const showMetadata = category || readTime
  const showFooter = author || date

  return (
    <Card className="max-w-sm flex flex-col w-full overflow-hidden shadow-md border border-border rounded-xl gap-3 bg-surface">
      {imageUrl && (
        <CardHeader className="p-0">
          <div className="relative w-full h-56">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="rounded-t-xl object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>
        </CardHeader>
      )}

      <CardContent className="p-4 flex-grow">
        {showMetadata && (
          <div className="flex items-center gap-2 text-sm text-foreground-muted mb-3">
            {category && (
              <Badge variant="primary" className="px-3 py-0.5 rounded-full">
                {category}
              </Badge>
            )}
            {category && readTime && <span>•</span>}
            {readTime && <span>{formatReadTime(readTime)}</span>}
          </div>
        )}

        <h2 className="text-xl font-semibold text-foreground mb-2 leading-tight">
          {title}
        </h2>

        {/*
          DECISION: Using the Webkit-specific line-clamp properties for multi-line text truncation.
          This is a non-standard but widely supported CSS technique that provides a clean way to
          truncate text to a specific number of lines without complex JavaScript.
        */}
        <p
          className={cn('text-foreground-muted', {
            'overflow-hidden text-ellipsis [-webkit-box-orient:vertical] [display:-webkit-box]':
              truncateLines && truncateLines > 0,
          })}
          style={{
            WebkitLineClamp: truncateLines,
          }}
        >
          {description}
        </p>
      </CardContent>

      {showFooter && (
        <CardFooter className="flex justify-between items-center p-4 border-t bg-surface">
          {author && (
            <div>
              <p className="text-xs text-foreground-muted">Ditulis oleh</p>
              <p className="text-sm font-medium text-foreground">{author}</p>
            </div>
          )}
          {date && (
            <div className={author ? 'text-right' : ''}>
              <p className="text-xs text-foreground-muted">Diposting pada</p>
              <p className="text-sm font-medium text-foreground">
                {formatPostDate(date)}
              </p>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
