"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Star,
  StarOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminUploads } from "@/services/medusa-admin.service";

export interface UploadedImage {
  id: string; // Medusa file ID
  url: string; // Public URL (MinIO/CDN)
  isPrimary?: boolean;
}

export interface ImageUploadProps {
  value?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  className?: string;
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";
const DEFAULT_MAX_SIZE = 5; // MB
const DEFAULT_MAX_IMAGES = 5;

export function ImageUpload({
  value = [],
  onChange,
  maxImages = DEFAULT_MAX_IMAGES,
  maxSizeMB = DEFAULT_MAX_SIZE,
  accept = ACCEPTED_TYPES,
  label = "Gambar Produk",
  className,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(value);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setImages(value);
  }, [value]);

  // Create local preview URLs for new uploads
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      setError(null);

      // Validate count
      if (images.length + fileArray.length > maxImages) {
        setError(`Maksimal ${maxImages} gambar`);
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} bukan file gambar`);
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`${file.name} terlalu besar (maks ${maxSizeMB}MB)`);
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Create local preview URLs for immediate feedback
      const newImages: UploadedImage[] = validFiles.map((file, i) => ({
        id: `temp-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        isPrimary: images.length === 0 && i === 0,
      }));

      const updated = [...images, ...newImages];
      setImages(updated);
      // Jangan emit onChange dengan blob URL — tunggu upload selesai
      // onChange?.(updated);

      setUploading(true);
      setUploadProgress(0);

      try {
        // Upload to backend
        const result = (await adminUploads.uploadFiles(validFiles)) as {
          id: string;
          url: string;
        }[];

        // Replace temp images with uploaded ones
        const uploadedImages: UploadedImage[] = (result ?? []).map((f, i) => ({
          id: f.id,
          url: f.url,
          isPrimary: updated.length > 0 ? updated[0].isPrimary : i === 0,
        }));

        // Remove temp images and add uploaded ones
        const final = [...updated.slice(0, -newImages.length), ...uploadedImages];
        setImages(final);
        onChange?.(final);

        setUploadProgress(100);
      } catch (err: any) {
        setError(err.message ?? "Gagal upload gambar");
        // Revert to previous state on error
        const reverted = updated.slice(0, -newImages.length);
        setImages(reverted);
        // onChange?.(reverted); — sudah tidak perlu, onChange sebelumnya tidak diemit dengan blob
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, maxSizeMB, onChange],
  );

  const removeImage = useCallback(
    (imageId: string) => {
      const removed = images.find((i) => i.id === imageId);
      if (removed && removed.url.startsWith("blob:")) {
        URL.revokeObjectURL(removed.url);
      }
      const updated = images.filter((i) => i.id !== imageId);
      setImages(updated);
      onChange?.(updated);
    },
    [images, onChange],
  );

  const setPrimary = useCallback(
    (imageId: string) => {
      const updated = images.map((i) => ({
        ...i,
        isPrimary: i.id === imageId,
      }));
      setImages(updated);
      onChange?.(updated);
    },
    [images, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = ""; // Reset so same file can be re-selected
      }
    },
    [handleFiles],
  );

  const displayImages = images.map((img) => ({
    ...img,
    displayUrl: img.url,
  }));

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      {/* Label */}
      <label className="text-sm font-semibold text-foreground">{label}</label>

      {/* Error message */}
      {error && <p className="text-xs text-error">{error}</p>}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer",
            "flex flex-col items-center justify-center min-h-[120px] gap-2",
            "bg-surface shadow-inset focus:shadow-inset-deep",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background",
            dragOver
              ? "border-primary bg-primary/5 shadow-inset-deep"
              : "border-border hover:border-primary/50",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-sm text-foreground-muted">
                Mengupload gambar...
              </p>
              <div className="w-32 h-1.5 bg-surface rounded-full overflow-hidden shadow-inset-small">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="size-6 text-foreground-subtle" />
              <p className="text-sm text-foreground-muted">
                Seret gambar ke sini atau{" "}
                <span className="text-primary font-semibold">
                  klik untuk pilih
                </span>
              </p>
              <p className="text-xs text-foreground-subtle">
                JPG, PNG, WebP — Maks {maxSizeMB}MB per gambar ({images.length}/
                {maxImages})
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={handleInputChange}
            disabled={uploading}
          />
        </div>
      )}

      {/* Image Preview Grid */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayImages.map((img) => (
            <div
              key={img.id}
              className={cn(
                "relative group rounded-2xl overflow-hidden bg-surface shadow-inset",
                img.isPrimary &&
                  "ring-2 ring-primary ring-offset-[2px] ring-offset-background",
              )}
            >
              {/* Image */}
              <div className="aspect-square">
                <img
                  src={img.displayUrl}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-2 left-2">
                  <div className="size-6 rounded-full bg-primary flex items-center justify-center shadow-extruded">
                    <Star className="size-3 text-white" fill="white" />
                  </div>
                </div>
              )}

              {/* Action overlay */}
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(img.id);
                    }}
                    className="size-8 rounded-full bg-surface shadow-extruded flex items-center justify-center text-foreground-muted hover:text-primary transition-colors"
                    title="Jadikan gambar utama"
                  >
                    <StarOff className="size-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className="size-8 rounded-full bg-surface shadow-extruded flex items-center justify-center text-foreground-muted hover:text-error transition-colors"
                  title="Hapus gambar"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
