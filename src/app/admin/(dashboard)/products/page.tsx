'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminProducts, adminCategories, adminInventory, adminStockLocations } from '@/services/medusa-admin.service'
import { medusa } from '@/lib/medusa/client'
import { formatCurrency, parseCurrency } from '@/utils'
import { cn } from '@/lib/utils'
import { Button, Input, Modal, Card, CardTitle, Badge, IconWell, ImageUpload, type UploadedImage } from '@/components/ui/neu'
import { Package, Plus, Search, Pencil, Trash2, ImageOff, PackageOpen, Tag, HelpCircle, Minus, Plus as PlusIcon, Loader2 } from 'lucide-react'

type MedusaProduct = {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  status?: string
  created_at?: string
  variants?: {
    id: string
    title: string
    sku?: string
    prices?: { amount: number; currency_code: string }[]
    inventory_items?: { inventory_item_id: string }[]
  }[]
  images?: { id: string; url: string; alt?: string }[]
  categories?: { id: string; name: string; handle: string }[]
}

type DisplayProduct = {
  id: string
  name: string
  slug: string
  price: number
  thumbnail?: string
  status: string
  variantCount: number
  imageCount: number
  category?: string
  stock: number
  description?: string
  sku?: string
  categoryId?: string
}

function mapProduct(p: MedusaProduct): DisplayProduct {
  const firstVariant = p.variants?.[0]
  const firstPrice = firstVariant?.prices?.[0]
  // Compute total stock from inventory items
  let totalStock = 0
  if (firstVariant?.inventory_items?.[0]?.inventory_item_id) {
    // Stock will be computed separately if needed
  }
  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    price: firstPrice?.amount ?? 0,
    thumbnail: p.thumbnail ?? p.images?.[0]?.url,
    status: p.status ?? 'draft',
    variantCount: p.variants?.length ?? 0,
    imageCount: p.images?.length ?? 0,
    category: p.categories?.[0]?.name,
    stock: 0,
    description: p.description,
    sku: firstVariant?.sku,
    categoryId: p.categories?.[0]?.id,
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
    published: { label: 'Aktif', variant: 'success' },
    draft: { label: 'Draft', variant: 'warning' },
    proposed: { label: 'Proposal', variant: 'default' },
    rejected: { label: 'Ditolak', variant: 'error' },
  }
  const s = map[status] ?? { label: status, variant: 'default' }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedProduct, setSelectedProduct] = useState<DisplayProduct | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formPriceRaw, setFormPriceRaw] = useState('')
  const [formSku, setFormSku] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formImages, setFormImages] = useState<UploadedImage[]>([])
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published')
  const [formStock, setFormStock] = useState('0')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [showPriceTooltip, setShowPriceTooltip] = useState(false)
  const [variantId, setVariantId] = useState<string>('')
  const [inventoryItemId, setInventoryItemId] = useState<string>('')

  // Price input handlers
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setFormPriceRaw(raw)
    if (raw) {
      setFormPrice(formatCurrency(parseInt(raw, 10)))
    } else {
      setFormPrice('')
    }
  }

  const handlePriceBlur = () => {
    if (formPriceRaw) {
      setFormPrice(formatCurrency(parseInt(formPriceRaw, 10)))
    }
  }

  const handlePriceStep = (delta: number) => {
    const current = parseCurrency(formPrice)
    const newVal = Math.max(0, current + delta)
    setFormPriceRaw(String(newVal))
    setFormPrice(formatCurrency(newVal))
  }

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        adminProducts.list({ limit: 50, q: search || undefined }),
        adminCategories.list({ limit: 50 }),
      ])
      setProducts((productsRes.data ?? []).map(mapProduct))
      setTotal(productsRes.total ?? 0)
      setCategories((categoriesRes.data ?? []).map((c: any) => ({ id: c.id, name: c.name })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchData() }, [fetchData])

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormPrice('')
    setFormPriceRaw('')
    setFormSku('')
    setFormCategoryId('')
    setFormImages([])
    setFormStatus('published')
    setFormStock('0')
    setVariantId('')
    setInventoryItemId('')
  }

  const openCreate = () => {
    setModalMode('create')
    setSelectedProduct(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = async (product: DisplayProduct) => {
    setModalMode('edit')
    setSelectedProduct(product)
    // Set basic display values immediately from the list view data
    setFormTitle(product.name)
    setFormStatus(product.status === 'published' ? 'published' : 'draft')
    const price = product.price ?? 0
    setFormPriceRaw(String(price))
    setFormPrice(price > 0 ? formatCurrency(price) : '')
    setFormCategoryId(product.categoryId ?? '')
    setFormDescription(product.description ?? '')
    setFormSku(product.sku ?? '')
    setFormImages([])
    setFormStock('0')
    // Fetch full product details from backend (prices, images, inventory)
    setLoadingProduct(true)
    try {
      const fullProduct = await adminProducts.get(product.id)
      const firstVariant = fullProduct?.variants?.[0]
      const firstPrice = firstVariant?.prices?.[0]
      const invItemId = firstVariant?.inventory_items?.[0]?.inventory_item_id

      // Override price with actual data from backend if available
      if (firstPrice?.amount != null) {
        setFormPriceRaw(String(firstPrice.amount))
        setFormPrice(firstPrice.amount > 0 ? formatCurrency(firstPrice.amount) : '')
      }

      // Override status with backend data
      if (fullProduct?.status) {
        setFormStatus(fullProduct.status === 'published' ? 'published' : 'draft')
      }

      setVariantId(firstVariant?.id ?? '')
      setInventoryItemId(invItemId ?? '')

      // Load existing images
      const existingImages: UploadedImage[] = (fullProduct?.images ?? []).map((img: any, i: number) => ({
        id: img.id,
        url: img.url,
        isPrimary: i === 0,
      }))
      setFormImages(existingImages)

      // Fetch stock if there's an inventory item
      if (invItemId) {
        const levels = await adminInventory.getLevels(invItemId)
        const totalStock = levels.reduce(
          (sum: number, loc: any) => sum + (loc.stocked_quantity ?? 0),
          0,
        )
        setFormStock(String(totalStock))
      }
    } catch (err) {
      console.error('Failed to load product details:', err)
    } finally {
      setLoadingProduct(false)
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    try {
      if (modalMode === 'create') {
        const priceNum = parseInt(formPriceRaw) || 0
        const stockNum = parseInt(formStock) || 0
        const primaryImage = formImages.find(i => i.isPrimary) ?? formImages[0]

        const product = await adminProducts.create({
          title: formTitle,
          description: formDescription || undefined,
          status: formStatus as any,
          ...(formCategoryId && { categories: [{ id: formCategoryId }] }),
          ...(primaryImage && { thumbnail: primaryImage.url }),
          ...(formImages.length > 0 && { images: formImages.map(i => ({ url: i.url })) }),
          options: [{ title: 'Size', values: ['Default'] }],
          variants: [{
            title: formTitle, // Use product name as variant title (Medusa uses this for inventory item title)
            sku: formSku || undefined,
            manage_inventory: true,
            options: { Size: 'Default' },
            prices: [{ currency_code: 'idr', amount: priceNum }],
          }],
        })

        // Set stock via inventory item location levels (Medusa v2)
        // Also update inventory item title to match product name
        if (stockNum > 0 && product?.variants?.[0]?.inventory_items?.[0]?.inventory_item_id) {
          const invItemId = product.variants[0].inventory_items[0].inventory_item_id
          // Update inventory item title to match product name
          await adminInventory.update(invItemId, { title: formTitle })
          await adminInventory.restock(invItemId, stockNum)
        } else if (product?.variants?.[0]?.inventory_items?.[0]?.inventory_item_id) {
          // Even without stock, update inventory item title
          const invItemId = product.variants[0].inventory_items[0].inventory_item_id
          await adminInventory.update(invItemId, { title: formTitle })
        }
      } else if (selectedProduct) {
        const priceNum = parseInt(formPriceRaw) || 0
        const stockNum = parseInt(formStock) || 0
        const primaryImage = formImages.find(i => i.isPrimary) ?? formImages[0]

        // Update product details
        await adminProducts.update(selectedProduct.id, {
          title: formTitle,
          description: formDescription || undefined,
          status: formStatus,
          ...(formCategoryId ? { categories: [{ id: formCategoryId }] } : { categories: [] }),
          thumbnail: primaryImage?.url,
          ...(formImages.length > 0 && { images: formImages.map(i => ({ url: i.url })) }),
        })

        // Update variant price and SKU
        if (variantId) {
          await adminProducts.updateVariant(selectedProduct.id, variantId, {
            sku: formSku || undefined,
            prices: [{ currency_code: 'idr', amount: priceNum }],
          })
        }

        // Update stock via inventory location levels
        if (inventoryItemId) {
          await adminInventory.restock(inventoryItemId, stockNum)
        }
      }
      setModalOpen(false)
      fetchData()
    } catch (err: any) {
      alert('Gagal: ' + (err.message ?? 'Unknown error'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await adminProducts.delete(deleteId)
      setDeleteModalOpen(false)
      setDeleteId(null)
      fetchData()
    } catch (err: any) {
      alert('Gagal hapus: ' + (err.message ?? 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Produk</h1>
          <p className="text-sm text-foreground-muted">{total} produk total</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Produk</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Harga</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Varian</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Gambar</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-foreground-muted">
                    <Package className="size-10 mx-auto mb-3 text-foreground-subtle" />
                    <p>Belum ada produk</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{product.name}</p>
                      <p className="text-xs text-foreground-muted">{product.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">{product.category || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">{product.price ? formatCurrency(product.price) : '-'}</td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">{product.variantCount}</td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">{product.imageCount}</td>
                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all" aria-label="Edit">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => { setDeleteId(product.id); setDeleteModalOpen(true) }} className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error active:shadow-inset-deep transition-all" aria-label="Hapus">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen} title={modalMode === 'create' ? 'Tambah Produk' : 'Edit Produk'} size="lg">
        {loadingProduct ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="ml-3 text-foreground-muted">Memuat detail produk...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nama Produk" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Deskripsi</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Deskripsi produk..."
                className="w-full rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Harga with custom controls */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-foreground">Harga (IDR)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formPrice}
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    placeholder="Rp 0"
                    className="w-full h-12 rounded-2xl bg-surface px-4 pr-14 text-sm text-foreground placeholder:text-foreground-subtle shadow-inset focus:shadow-inset-deep transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handlePriceStep(1000)}
                      className="size-5 rounded-md shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                      tabIndex={-1}
                    >
                      <PlusIcon className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePriceStep(-1000)}
                      className="size-5 rounded-md shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                      tabIndex={-1}
                    >
                      <Minus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
              {/* SKU with tooltip */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-semibold text-foreground">SKU</label>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowPriceTooltip(true)}
                      onMouseLeave={() => setShowPriceTooltip(false)}
                      className="size-4 rounded-full shadow-inset-small flex items-center justify-center text-foreground-subtle hover:text-primary transition-colors"
                      tabIndex={-1}
                    >
                      <HelpCircle className="size-3" />
                    </button>
                    {showPriceTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-3 rounded-xl bg-surface shadow-extruded z-50 text-xs text-foreground-muted leading-relaxed">
                        <p>
                          <span className="font-semibold text-foreground">SKU</span> (Stock Keeping Unit) adalah kode unik untuk mengidentifikasi setiap produk. Contoh: <span className="font-mono text-foreground">WP-RO-001</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  placeholder="e.g. WP-RO-001"
                  className="w-full h-12 rounded-2xl bg-surface px-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-inset focus:shadow-inset-deep transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Kategori</label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Status switch */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-foreground">Status</label>
                <button
                  type="button"
                  onClick={() => setFormStatus(formStatus === 'published' ? 'draft' : 'published')}
                  className="flex items-center gap-3"
                >
                  <div className={cn(
                    'relative w-12 h-7 rounded-full transition-colors duration-200',
                    formStatus === 'published' ? 'bg-success' : 'bg-foreground-subtle',
                  )}>
                    <div className={cn(
                      'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200',
                      formStatus === 'published' && 'translate-x-5',
                    )} />
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    formStatus === 'published' ? 'text-success' : 'text-foreground-muted',
                  )}>
                    {formStatus === 'published' ? 'Aktif' : 'Draft'}
                  </span>
                </button>
              </div>
              {/* Stock input */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-foreground">Stok</label>
                <input
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 rounded-2xl bg-surface px-4 text-sm text-foreground placeholder:text-foreground-subtle shadow-inset focus:shadow-inset-deep transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                />
              </div>
            </div>
            <ImageUpload
              value={formImages}
              onChange={setFormImages}
              maxImages={5}
              maxSizeMB={5}
              label="Gambar Produk"
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Batal</Button>
              <Button type="submit" className="flex-1" isLoading={formSubmitting}>
                {modalMode === 'create' ? 'Buat' : 'Simpan'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} title="Hapus Produk" size="sm">
        <p className="text-foreground-muted mb-6">Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)} className="flex-1">Batal</Button>
          <Button variant="danger" onClick={confirmDelete} className="flex-1">Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
