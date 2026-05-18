import { ProductGrid } from '@/components/product/ProductGrid'
import { listProducts, listCategories } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductsPageProps {
  searchParams: {
    page?: string
    limit?: string
    category?: string
    search?: string
    sort?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '12')
  const category = searchParams.category
  const search = searchParams.search
  const sort = searchParams.sort || 'newest'

  // Fetch data at server (SSR)
  const [productsRes, categoriesRes] = await Promise.all([
    listProducts({
      offset: (page - 1) * limit,
      limit,
      category,
      search,
      sort: sort as any,
    }),
    listCategories(),
  ])

  const initialProducts = productsRes.success ? productsRes.data : []
  const categories = categoriesRes.success ? categoriesRes.data : []
  const totalProducts = productsRes.meta?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit))

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-foreground">
        Semua <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Produk</span>
      </h1>
      <ProductGrid 
        initialProducts={initialProducts}
        initialCategories={categories}
        initialMeta={{
          total: totalProducts,
          page,
          limit,
          totalPages,
        }}
        initialSearch={search}
        initialCategory={category}
        initialSort={sort as any}
      />
    </div>
  )
}
