"use client";

import { useEffect, useState, useCallback } from "react";
import { adminProvinces } from "@/services/medusa-admin.service";
import {
  Button,
  Card,
  CardTitle,
  Badge,
  Modal,
  Input,
} from "@/components/ui/neu";
import { MapPin, Plus, Search, Pencil, Trash2 } from "lucide-react";

type Province = {
  id: string;
  name: string;
  code?: string;
};

export default function AdminProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Province | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminProvinces.list();
      setProvinces((res.data as any) ?? []);
      setTotal((res as any).total ?? 0);
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
  };

  const openCreate = () => {
    setModalMode("create");
    setSelected(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (p: Province) => {
    setModalMode("edit");
    setSelected(p);
    setFormName(p.name);
    setFormCode(p.code ?? "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Provinces are read-only from RajaOngkir API
      alert(
        "Provinsi dikelola secara otomatis dari API RajaOngkir dan tidak dapat diubah.",
      );
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + (err.message ?? "Unknown"));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    // Provinces are read-only
    alert("Provinsi tidak dapat dihapus.");
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const filtered = provinces.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code ?? "").toLowerCase().includes(search.toLowerCase()),
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
            Provinsi
          </h1>
          <p className="text-sm text-foreground-muted">
            {total} provinsi total
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Tambah Provinsi
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari provinsi..."
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
                  Nama Provinsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                  Kode
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
                    colSpan={3}
                    className="p-12 text-center text-foreground-muted"
                  >
                    <MapPin className="size-10 mx-auto mb-3 text-foreground-subtle" />
                    <p>Belum ada provinsi</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{p.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-foreground-muted">
                      {p.code || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(p.id);
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
        title={modalMode === "create" ? "Tambah Provinsi" : "Edit Provinsi"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Provinsi"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            placeholder="Jawa Barat"
          />
          <Input
            label="Kode (opsional)"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toUpperCase())}
            placeholder="32"
            helperText="Kode BPS provinsi (opsional)"
          />
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
        title="Hapus Provinsi"
        size="sm"
      >
        <p className="text-foreground-muted mb-6">
          Apakah Anda yakin ingin menghapus provinsi ini?
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
