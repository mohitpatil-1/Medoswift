import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export default function AdminUsers() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/api/admin/users");
      setItems(data.items || []);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to load users", "error");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(u =>
      (u.name || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      (u.role || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  async function saveEdit() {
    try {
      await api.patch(`/api/admin/users/${editing._id}`, {
        name: editing.name,
        phone: editing.phone,
        role: editing.role,
        defaultPaymentMethod: editing.defaultPaymentMethod,
      });
      toast.push("Updated", "success");
      setEditing(null);
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  async function doDelete() {
    try {
      await api.delete(`/api/admin/users/${confirmDelete._id}`);
      toast.push("Deleted", "success");
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Admin</div>
        <div className="text-2xl font-extrabold">Users</div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="max-w-md w-full">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search users by name, email or role…" />
          </div>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{filtered.length}</span></div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Payment</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.phone || "—"}</div>
                  </td>
                  <td className="text-slate-700">{u.email}</td>
                  <td><Badge>{u.role}</Badge></td>
                  <td className="text-slate-700">{u.defaultPaymentMethod || "UPI"}</td>
                  <td className="text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" onClick={() => setEditing({ ...u })}>Edit</Button>
                      <Button variant="danger" onClick={() => setConfirmDelete(u)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="py-6 text-slate-500" colSpan={6}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit user">
        {editing && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Name</div>
              <Input value={editing.name || ""} onChange={(e)=>setEditing(s=>({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Phone</div>
              <Input value={editing.phone || ""} onChange={(e)=>setEditing(s=>({ ...s, phone: e.target.value }))} placeholder="Optional" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Role</div>
                <Select value={editing.role} onChange={(e)=>setEditing(s=>({ ...s, role: e.target.value }))}>
                  <option value="user">user</option>
                  <option value="doctor">doctor</option>
                  <option value="admin">admin</option>
                </Select>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Default payment</div>
                <Select value={editing.defaultPaymentMethod || "UPI"} onChange={(e)=>setEditing(s=>({ ...s, defaultPaymentMethod: e.target.value }))}>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete user">
        {confirmDelete && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              This will permanently delete <span className="font-semibold">{confirmDelete.email}</span>.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={doDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
