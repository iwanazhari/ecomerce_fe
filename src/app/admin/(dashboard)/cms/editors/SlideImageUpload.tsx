'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { adminUploads } from '@/services/admin.service'
import { getImageUrl } from '@/utils'

export function SlideImageUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Maksimal 5MB')
      return
    }

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)

    try {
      const result = await adminUploads.uploadFiles([file])
      const uploaded = result?.[0]
      if (uploaded?.url) {
        onChange(uploaded.url)
      }
    } catch {
      alert('Gagal upload gambar')
      setPreview(value || null)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const remove = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setPreview(null)
    onChange('')
  }

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden bg-surface border border-border group">
        <img src={getImageUrl(preview) || preview} alt="" className="w-full h-24 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <button
            type="button"
            onClick={remove}
            className="opacity-0 group-hover:opacity-100 rounded-full bg-error p-1.5 text-white transition-opacity"
          >
            <X className="size-3.5" />
          </button>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 className="size-5 text-primary animate-spin" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface px-3 py-6 text-foreground-subtle hover:border-primary/50 hover:bg-primary/5 transition-colors"
    >
      {uploading ? (
        <Loader2 className="size-4 animate-spin text-primary" />
      ) : (
        <Upload className="size-4" />
      )}
      <span className="text-xs font-medium">Upload Gambar</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  )
}
