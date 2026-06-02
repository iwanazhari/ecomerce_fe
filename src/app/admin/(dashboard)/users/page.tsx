"use client";

import { useEffect, useState, useCallback } from "react";
import { adminUsers } from "@/services/admin.service";
import { useAuth } from "@/hooks/useAuthContext";
import { AdminGuard, RequirePermission } from "@/components/admin/AdminGuard";
import {
  Button,
  Card,
  CardTitle,
  Badge,
  Modal,
} from "@/components/ui/neu";
import { Users, Search, Shield, AlertTriangle, ShieldAlert } from "lucide-react";
import type { User, UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  CONTENT_MANAGER: "Content Manager",
  SALES_REP: "Sales Rep",
};

const ROLE_VARIANTS: Record<UserRole, "success" | "warning" | "error" | "info" | "default"> = {
  CUSTOMER: "default",
  ADMIN: "info",
  SUPER_ADMIN: "error",
  CONTENT_MANAGER: "warning",
  SALES_REP: "success",
};

const AVAILABLE_ROLES: UserRole[] = [
  "CUSTOMER",
  "ADMIN",
  "CONTENT_MANAGER",
  "SALES_REP",
  "SUPER_ADMIN",
];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("CUSTOMER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminUsers.list({
        limit: 100,
        ...(search ? { search } : {}),
      });
      setUsers(result.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
    setError("");
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || newRole === selectedUser.role) {
      setRoleModalOpen(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminUsers.updateRole(selectedUser.id, newRole);
      setRoleModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err: any) {
      setError(err.message ?? "Gagal mengubah role");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!confirm(`${user.isActive ? "Nonaktifkan" : "Aktifkan"} user ${user.email}?`)) return;
    try {
      await adminUsers.toggleActive(user.id);
      fetchData();
    } catch (err: any) {
      alert(err.message ?? "Gagal mengubah status");
    }
  };

  const filtered = users.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AdminGuard requirePermissions={["users:read"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Pengguna
            </h1>
            <p className="text-sm text-foreground-muted">
              {users.length} pengguna terdaftar
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cari email atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
          />
        </div>

        {/* Users Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                    Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground-muted uppercase tracking-wider shadow-inset-small">
                    Role
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-foreground-muted">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-foreground-muted">
                      <Users className="size-10 mx-auto mb-3 text-foreground-subtle" />
                      <p>Tidak ada pengguna ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-2xl shadow-inset-deep flex items-center justify-center text-primary font-extrabold text-sm">
                            {(u.firstName?.[0] ?? u.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {u.firstName ? `${u.firstName} ${u.lastName ?? ""}`.trim() : "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ROLE_VARIANTS[u.role]}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isActive ? "success" : "error"}>
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <RequirePermission permission="users:updateRole">
                            <button
                              onClick={() => openRoleModal(u)}
                              disabled={u.id === currentUser?.id}
                              className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-primary active:shadow-inset-deep transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Ubah Role"
                              title={u.id === currentUser?.id ? "Tidak bisa mengubah role sendiri" : "Ubah Role"}
                            >
                              <Shield className="size-4" />
                            </button>
                          </RequirePermission>
                          <RequirePermission permission="users:activate">
                            <button
                              onClick={() => handleToggleActive(u)}
                              disabled={u.id === currentUser?.id}
                              className="size-10 rounded-2xl shadow-inset-small flex items-center justify-center text-foreground-muted hover:text-warning active:shadow-inset-deep transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label={u.isActive ? "Nonaktifkan" : "Aktifkan"}
                              title={u.id === currentUser?.id ? "Tidak bisa menonaktifkan diri sendiri" : u.isActive ? "Nonaktifkan" : "Aktifkan"}
                            >
                              <AlertTriangle className="size-4" />
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Role Change Modal */}
        <Modal
          open={roleModalOpen}
          onOpenChange={setRoleModalOpen}
          title="Ubah Role Pengguna"
          size="sm"
        >
          {selectedUser && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl shadow-inset-deep">
                <p className="font-bold text-foreground">
                  {selectedUser.firstName
                    ? `${selectedUser.firstName} ${selectedUser.lastName ?? ""}`.trim()
                    : selectedUser.email}
                </p>
                <p className="text-sm text-foreground-muted">{selectedUser.email}</p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl shadow-[inset_4px_4px_8px_rgb(239,68,68,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] bg-error/5">
                  <p className="text-sm text-error font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Role Baru
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full h-12 rounded-2xl bg-surface shadow-inset focus:shadow-inset-deep px-4 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-[2px] focus:ring-offset-background"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>

              {newRole === "SUPER_ADMIN" && (
                <div className="flex items-center gap-2 p-3 rounded-2xl shadow-inset-small text-xs text-warning">
                  <ShieldAlert className="size-4 shrink-0" />
                  Memberikan akses SUPER_ADMIN memberikan kendali penuh atas sistem
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRoleModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleRoleUpdate}
                  className="flex-1"
                  isLoading={saving}
                  disabled={newRole === selectedUser.role}
                >
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminGuard>
  );
}
