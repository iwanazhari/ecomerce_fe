"use client";

import { useEffect, useState, useCallback } from "react";
import { adminExpeditions } from "@/services/medusa-admin.service";
import {
  Button,
  Card,
  CardTitle,
  Badge,
  Modal,
  Input,
} from "@/components/ui/neu";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

type Expedition = {
  id: string;
  name: string;
  code: string;
  tracking_url_template?: string;
  is_active: boolean;
  description?: string;
  flat_rate: number;
  is_store_delivery: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function AdminExpeditionsPage() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Expedition | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formTrackingUrl, setFormTrackingUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFlatRate, setFormFlatRate] = useState("0");
  const [formIsStoreDelivery, setIsStoreDelivery] = useState(false);
  const [formIsActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminExpeditions.list({ limit: 100 });
      setExpeditions((res.data as any) ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormName("");
    setFormCode("");
    setFormTrackingUrl("");
    setFormDescription("");
    setFormFlatRate("0");
    setIsStoreDelivery(false);
    setIsActive(true);
  };

  const openCreate = () => {
    setModalMode("create");
    setSelected(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (exp: Expedition) => {
    setModalMode("edit");
    setSelected(exp);
    setFormName(exp.name);
    setFormCode(exp.code);
    setFormTrackingUrl(exp.tracking_url_template ?? "");
    setFormDescription(exp.description ?? "");
    setFormFlatRate(String(exp.flat_rate ?? 0));
    setIsStoreDelivery(exp.is_store_delivery ?? false);
    setIsActive(exp.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rate = parseInt(formFlatRate) || 0;
      if (modalMode === "create") {
        await adminExpeditions.create({
          name: formName,
          code: formCode,
          type: formCode.toUpperCase(),
          pricing: { flat_rate: rate },
          isActive: formIsActive,
          isDefault: false,
        } as any);
      } else if (selected) {
        // Optimistic update: update status di list immediately
        const newStatus = formIsActive;
        setExpeditions(prev => prev.map(exp => 
          exp.id === selected.id 
            ? { ...exp, is_active: newStatus }
            : exp
        ));
        console.log("[handleSubmit] Updated expedition status:", newStatus);
        
        await adminExpeditions.update(selected.id, {
          name: formName,
          code: formCode,
          type: formCode.toUpperCase(),
          pricing: { flat_rate: rate },
          isActive: formIsActive,
          isDefault: false,
        } as any);
      }
      setModalOpen(false);
      
      // Don't refetch - optimistic update is sufficient
      // The list is already updated with correct status
    } catch (err: any) {
      alert("Gagal: " + (err.message ?? "Unknown"));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminExpeditions.delete(deleteId);
      setDeleteModalOpen(false);
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + (err.message ?? "Unknown"));
    }
  };

  const filtered = expeditions.filter(
    (e) =>
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Ekspedisi
          </h1>
          <p className="text-sm text-foreground-muted">
            {total} ekspedisi total
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Tambah Ekspedisi
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari ekspedisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Kode
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Ongkir
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-foreground-muted"
                  >
                    <Truck className="size-10 mx-auto mb-3 text-foreground-subtle" />
                    <p>Belum ada ekspedisi</p>
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{exp.name}</p>
                      {exp.description && (
                        <p className="text-xs text-foreground-muted">
                          {exp.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-foreground-muted">
                      {exp.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-foreground">
                      {exp.flat_rate > 0 ? (
                        `Rp ${exp.flat_rate.toLocaleString("id-ID")}`
                      ) : (
                        <span className="text-success">Gratis</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {exp.is_store_delivery ? (
                        <Badge variant="default">Kurir Toko</Badge>
                      ) : (
                        <Badge variant="default">Ekspedisi</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {exp.is_active ? (
                        <Badge variant="success">
                          <CheckCircle className="size-3 mr-1" /> Aktif
                        </Badge>
                      ) : (
                        <Badge variant="error">
                          <XCircle className="size-3 mr-1" /> Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(exp)}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(exp.id);
                            setDeleteModalOpen(true);
                          }}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-error active:shadow-inset-deep transition-all"
                          aria-label="Hapus"
                        >
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
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalMode === "create" ? "Tambah Ekspedisi" : "Edit Ekspedisi"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Ekspedisi"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            placeholder="JNE"
          />
          <Input
            label="Kode"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toLowerCase())}
            required
            placeholder="jne"
            helperText="Kode unik (huruf kecil, tanpa spasi)"
          />

          {/* Kurir Toko Toggle */}
          <div className="p-4 rounded-2xl bg-surface shadow-inset-small">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Kurir Toko
                </p>
                <p className="text-xs text-foreground-muted">
                  Aktifkan jika ini adalah pengiriman oleh toko sendiri
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreDelivery(!formIsStoreDelivery)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${formIsStoreDelivery ? "bg-primary" : "bg-foreground-subtle"}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${formIsStoreDelivery && "translate-x-5"}`}
                />
              </button>
            </div>
          </div>

          {/* Flat Rate Ongkir */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Ongkir (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formFlatRate}
              onChange={(e) => setFormFlatRate(e.target.value)}
              placeholder="0 = Gratis"
              className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
            />
            <p className="text-xs text-foreground-muted mt-1">
              Masukkan 0 untuk gratis ongkir
            </p>
          </div>

          <Input
            label="URL Tracking Template"
            value={formTrackingUrl}
            onChange={(e) => setFormTrackingUrl(e.target.value)}
            placeholder="https://www.jne.co.id/tracking?awb={tracking_number}"
            helperText="Gunakan {'{tracking_number}'} sebagai placeholder"
            disabled={formIsStoreDelivery}
          />
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Deskripsi
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              placeholder="Deskripsi ekspedisi..."
              className="w-full rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background resize-none"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!formIsActive)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${formIsActive ? "bg-success" : "bg-foreground-subtle"}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${formIsActive && "translate-x-5"}`}
              />
            </button>
            <span
              className={`text-sm font-semibold ${formIsActive ? "text-success" : "text-foreground-muted"}`}
            >
              {formIsActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" isLoading={submitting}>
              {modalMode === "create" ? "Buat" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Hapus Ekspedisi"
        size="sm"
      >
        <p className="text-foreground-muted mb-6">
          Apakah Anda yakin ingin menghapus ekspedisi ini?
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete} className="flex-1">
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
