import { getProductBySlug } from '@/lib/api'
import { ProductDetailContent } from '@/components/product/ProductDetailContent'
import { CmsPageRenderer } from '@/components/CmsPageRenderer'
import type { Product } from '@/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const res = await getProductBySlug(slug)
    if (res.success && res.data) {
      return {
        title: res.data.name,
        description: (res.data.shortDescription || res.data.description) ?? undefined,
        openGraph: {
          title: res.data.name,
          description: (res.data.shortDescription || res.data.description) ?? undefined,
          images: res.data.images?.[0]?.url ? [{ url: res.data.images[0].url }] : [],
        },
      }
    }
  } catch {
    // fallback
  }
  return { title: 'Produk' }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  
  // Fetch product on the server (SSR) so content renders immediately
  let initialProduct: Product | null = null
  try {
    const res = await getProductBySlug(slug)
    if (res.success && res.data) {
      initialProduct = res.data
    }
  } catch {
    // Client component will handle error state
  }

  return (
    <>
      <CmsPageRenderer page="product-detail" />
      <ProductDetailContent slug={slug} initialProduct={initialProduct} />
    </>
  )
}
