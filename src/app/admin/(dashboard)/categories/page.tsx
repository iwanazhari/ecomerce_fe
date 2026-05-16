'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminCategories } from '@/services/medusa-admin.service'
import { Button, Card, CardTitle, Badge, Modal, Input } from '@/components/ui/neu'
import { Tag, Plus, Search, Pencil, Trash2 } from 'lucide-react'

type Category = { id: string; name: string; handle: string; description?: string; is_internal?: boolean; is_active?: boolean; parent_category_id?: string }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<Category | null>(null)
  const [formName, setFormName] = useState('')
  const [formHandle, setFormHandle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await adminCategories.list({ limit: 100 })
      setCategories(res.data ?? [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setModalMode('create'); setSelected(null); setFormName(''); setFormHandle(''); setFormDesc(''); setModalOpen(true) }
  const openEdit = (cat: Category) => { setModalMode('edit'); setSelected(cat); setFormName(cat.name); setFormHandle(cat.handle ?? ''); setFormDesc(cat.description ?? ''); setModalOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (modalMode === 'create') {
        await adminCategories.create({ name: formName, handle: formHandle || undefined, description: formDesc || undefined })
      } else if (selected) {
        await adminCategories.update(selected.id, { name: formName, handle: formHandle || undefined, description: formDesc || undefined })
      }
      setModalOpen(false)
      fetchData()
    } catch (err: any) { alert('Gagal: ' + (err.message ?? 'Unknown')) }
    finally { setSubmitting(false) }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try { await adminCategories.delete(deleteId); setDeleteModalOpen(false); setDeleteId(null); fetchData() }
    catch (err: any) { alert('Gagal: ' + (err.message ?? 'Unknown')) }
  }

  const filtered = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Kategori</h1>
          <p className="text-sm text-foreground-muted">{categories.length} kategori total</p>
        </div>
        <Button onClick={openCreate}><Plus className="size-4" /> Tambah Kategori</Button>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input type="text" placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background" />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Handle</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Deskripsi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-foreground-muted"><Tag className="size-10 mx-auto mb-3 text-foreground-subtle" /><p>Belum ada kategori</p></td></tr>
              ) : filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4"><p className="font-bold text-foreground">{cat.name}</p></td>
                  <td className="px-6 py-4 text-sm text-foreground-muted font-mono">{cat.handle}</td>
                  <td className="px-6 py-4 text-sm text-foreground-muted line-clamp-1">{cat.description || '-'}</td>
                  <td className="px-6 py-4">{cat.is_active === false ? <Badge variant="error">Nonaktif</Badge> : <Badge variant="success">Aktif</Badge>}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"><Pencil className="size-4" /></button>
                      <button onClick={() => { setDeleteId(cat.id); setDeleteModalOpen(true) }} className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error active:shadow-inset-deep transition-all"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Nama Kategori" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          <Input label="Handle (slug)" value={formHandle} onChange={(e) => setFormHandle(e.target.value)} helperText="Opsional — otomatis dari nama" />
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Deskripsi</label>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3}
              className="w-full rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep p-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background resize-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Batal</Button>
            <Button type="submit" className="flex-1" isLoading={submitting}>{modalMode === 'create' ? 'Buat' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} title="Hapus Kategori" size="sm">
        <p className="text-foreground-muted mb-6">Apakah Anda yakin ingin menghapus kategori ini?</p>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeleteModalOpen(false)} className="flex-1">Batal</Button>
          <Button variant="danger" onClick={confirmDelete} className="flex-1">Hapus</Button>
        </div>
      </Modal>
    </div>
  )
}
