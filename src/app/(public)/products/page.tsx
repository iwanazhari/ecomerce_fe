import { ProductGrid } from '@/components/product/ProductGrid'

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-foreground">
        Semua <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Produk</span>
      </h1>
      <ProductGrid />
    </div>
  )
}
