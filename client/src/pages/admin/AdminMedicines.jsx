import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  price: 0,
  stock: 0,
  rating: 4.5,
  prescriptionRequired: false,
  icon: "💊",
};

export default function AdminMedicines() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/api/medicines", { params: { q, category, page: 1, limit: 50 } });
      setItems(data.items || []);
      setCategories(data.categories || ["All"]);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to load medicines", "error");
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [q, category]);

  const isEdit = !!(editing && editing._id);

  function openCreate() {
    setEditing({ ...emptyForm });
  }

  function openEdit(m) {
    setEditing({
      _id: m._id,
      name: m.name,
      category: m.category,
      description: m.description || "",
      price: m.price,
      stock: m.stock,
      rating: m.rating,
      prescriptionRequired: !!m.prescriptionRequired,
      icon: m.icon || "💊",
    });
  }

  async function save() {
    try {
      const payload = {
        ...editing,
        price: Number(editing.price),
        stock: Number(editing.stock),
        rating: Number(editing.rating),
        prescriptionRequired: !!editing.prescriptionRequired,
      };
      delete payload._id;

      if (isEdit) {
        await api.patch(`/api/medicines/${editing._id}`, payload);
        toast.push("Updated", "success");
      } else {
        await api.post(`/api/medicines`, payload);
        toast.push("Created", "success");
      }
      setEditing(null);
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  async function doDelete() {
    try {
      await api.delete(`/api/medicines/${confirmDelete._id}`);
      toast.push("Deleted", "success");
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  const lowStock = useMemo(() => items.filter(i => (i.stock || 0) <= 5), [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Admin</div>
          <div className="text-2xl font-extrabold">Medicines & inventory</div>
        </div>
        <Button onClick={openCreate}>Add Medicine</Button>
      </div>

      {lowStock.length > 0 && (
        <Card className="p-5 border border-amber-200 bg-amber-50">
          <div className="text-sm font-semibold text-amber-800">Low stock alert</div>
          <div className="mt-2 text-sm text-amber-800">{lowStock.slice(0, 6).map(m => m.name).join(", ")}{lowStock.length > 6 ? "…" : ""}</div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="max-w-md w-full">
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search medicines…" />
            </div>
            <div className="w-full md:w-56">
              <Select value={category} onChange={(e)=>setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{items.length}</span></div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="py-3">Medicine</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rx</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m._id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="h-8 w-8 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">{m.icon || "💊"}</span>
                      <span>{m.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 max-w-xl truncate">{m.description || ""}</div>
                  </td>
                  <td className="text-slate-700">{m.category}</td>
                  <td className="text-slate-700">₹{m.price}</td>
                  <td>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${m.stock <= 5 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                      {m.stock}
                    </span>
                  </td>
                  <td className="text-slate-700">{m.prescriptionRequired ? "Yes" : "No"}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openEdit(m)}>Edit</Button>
                      <Button variant="danger" onClick={() => setConfirmDelete(m)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="py-6 text-slate-500" colSpan={6}>No medicines found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isEdit ? "Edit medicine" : "Add medicine"}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Name</div>
                <Input value={editing.name} onChange={(e)=>setEditing(s=>({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Category</div>
                <Input value={editing.category} onChange={(e)=>setEditing(s=>({ ...s, category: e.target.value }))} placeholder="e.g., Fever" />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 mb-2">Description</div>
              <Input value={editing.description} onChange={(e)=>setEditing(s=>({ ...s, description: e.target.value }))} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Price (₹)</div>
                <Input type="number" value={editing.price} onChange={(e)=>setEditing(s=>({ ...s, price: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Stock</div>
                <Input type="number" value={editing.stock} onChange={(e)=>setEditing(s=>({ ...s, stock: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Rating</div>
                <Input type="number" step="0.1" value={editing.rating} onChange={(e)=>setEditing(s=>({ ...s, rating: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input type="checkbox" checked={!!editing.prescriptionRequired} onChange={(e)=>setEditing(s=>({ ...s, prescriptionRequired: e.target.checked }))} />
                <div className="text-sm text-slate-700">Prescription required</div>
              </label>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Icon</div>
                <Input value={editing.icon} onChange={(e)=>setEditing(s=>({ ...s, icon: e.target.value }))} placeholder="💊" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>{isEdit ? "Save" : "Create"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete medicine">
        {confirmDelete && (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">Delete <span className="font-semibold">{confirmDelete.name}</span> from inventory?</div>
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
