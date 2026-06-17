'use client'

import { useParams } from 'next/navigation'
import { useCategory } from '@/hooks'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Skeleton } from '@/components/ui/Skeleton'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: category, isLoading } = useCategory(slug!)

  return (
    <>
      <CmsPageRenderer page="categories" />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {isLoading ? (
        <Skeleton className="h-8 w-48" />
      ) : category ? (
        <div>
          <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
          {category.description && (
            <p className="mt-1 text-foreground-muted">{category.description}</p>
          )}
        </div>
      ) : null}
      <div className="mt-6">
        <ProductGrid />
      </div>
    </div>
    </>
  )
}
