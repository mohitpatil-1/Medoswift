import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

const STATUSES = ["Placed","Confirmed","On Way","Delivered","Cancelled"];

function money(v) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
  } catch {
    return `₹${Math.round(v || 0)}`;
  }
}

export default function AdminOrders() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingCourier, setEditingCourier] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/api/orders/mine");
      setItems(data.items || []);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to load orders", "error");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(o => {
      const okQ = !s || (o._id || "").toLowerCase().includes(s) || (o.user?.name || "").toLowerCase().includes(s) || (o.user?.email || "").toLowerCase().includes(s);
      const okS = statusFilter === "All" || o.status === statusFilter;
      return okQ && okS;
    });
  }, [items, q, statusFilter]);

  async function updateStatus(orderId, status) {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
      toast.push("Status updated", "success");
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  async function saveCourier() {
    try {
      await api.patch(`/api/orders/${editingCourier._id}/courier`, {
        lat: Number(editingCourier.lat),
        lng: Number(editingCourier.lng),
        etaMinutes: Number(editingCourier.etaMinutes || 0) || undefined,
      });
      toast.push("Courier updated", "success");
      setEditingCourier(null);
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Admin</div>
        <div className="text-2xl font-extrabold">Orders</div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="max-w-md w-full">
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by order ID or customer…" />
            </div>
            <div className="w-full md:w-56">
              <Select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                <option value="All">All statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{filtered.length}</span></div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">#{o._id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-slate-500">{o.items?.length || 0} items</div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">{o.user?.name || "—"}</div>
                    <div className="text-xs text-slate-500">{o.user?.email || "—"}</div>
                  </td>
                  <td className="text-slate-700">{money(o.total)}</td>
                  <td>
                    <Select value={o.status} onChange={(e)=>updateStatus(o._id, e.target.value)} className="max-w-[180px]">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </td>
                  <td className="text-slate-700">
                    {o.payment?.method || "—"} • <span className={o.payment?.status === "paid" ? "text-emerald-700" : "text-amber-700"}>{o.payment?.status || "pending"}</span>
                  </td>
                  <td className="text-slate-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => setEditingCourier({
                        _id: o._id,
                        lat: o.courier?.location?.lat ?? 12.9716,
                        lng: o.courier?.location?.lng ?? 77.5946,
                        etaMinutes: o.etaMinutes ?? 15,
                      })}>Courier</Button>
                      <Link to={`/orders/${o._id}`}>
                        <Button>View</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="py-6 text-slate-500" colSpan={7}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editingCourier} onClose={() => setEditingCourier(null)} title="Courier location">
        {editingCourier && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">Update courier coordinates for tracking map + real-time updates.</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Latitude</div>
                <Input type="number" step="0.0001" value={editingCourier.lat} onChange={(e)=>setEditingCourier(s=>({ ...s, lat: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Longitude</div>
                <Input type="number" step="0.0001" value={editingCourier.lng} onChange={(e)=>setEditingCourier(s=>({ ...s, lng: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">ETA (mins)</div>
                <Input type="number" value={editingCourier.etaMinutes} onChange={(e)=>setEditingCourier(s=>({ ...s, etaMinutes: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditingCourier(null)}>Cancel</Button>
              <Button onClick={saveCourier}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
