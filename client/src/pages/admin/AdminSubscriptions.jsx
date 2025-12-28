import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

const STATUSES = ["active","cancelled","expired"];

export default function AdminSubscriptions() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/api/admin/subscriptions");
      setItems(data.items || []);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to load subscriptions", "error");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(x =>
      (x.user?.name || "").toLowerCase().includes(s) ||
      (x.user?.email || "").toLowerCase().includes(s) ||
      (x.plan || "").toLowerCase().includes(s) ||
      (x.status || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  async function save() {
    try {
      await api.patch(`/api/admin/subscriptions/${editing._id}`, {
        status: editing.status,
        endAt: editing.endAt,
      });
      toast.push("Updated", "success");
      setEditing(null);
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Admin</div>
        <div className="text-2xl font-extrabold">Organizer subscriptions</div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="max-w-md w-full">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by user, email, plan or status…" />
          </div>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{filtered.length}</span></div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-3">User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{s.user?.name || "—"}</div>
                    <div className="text-xs text-slate-500">{s.user?.email || "—"}</div>
                  </td>
                  <td className="text-slate-700">{s.plan}</td>
                  <td>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${s.status === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="text-slate-500">{s.startAt ? new Date(s.startAt).toLocaleDateString() : "—"}</td>
                  <td className="text-slate-500">{s.endAt ? new Date(s.endAt).toLocaleDateString() : "—"}</td>
                  <td className="text-right">
                    <Button variant="secondary" onClick={() => setEditing({
                      _id: s._id,
                      status: s.status,
                      endAt: s.endAt ? new Date(s.endAt).toISOString().slice(0, 10) : "",
                    })}>Edit</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="py-6 text-slate-500" colSpan={6}>No subscriptions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit subscription">
        {editing && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Status</div>
              <Select value={editing.status} onChange={(e)=>setEditing(s=>({ ...s, status: e.target.value }))}>
                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">End date</div>
              <Input type="date" value={editing.endAt} onChange={(e)=>setEditing(s=>({ ...s, endAt: e.target.value }))} />
              <div className="text-xs text-slate-500 mt-2">Set an end date to expire the subscription. Leave empty to keep it unchanged.</div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
