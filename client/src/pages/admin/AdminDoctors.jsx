import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function AdminDoctors() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/api/doctors/admin/all");
      setItems(data.items || []);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to load doctors", "error");
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(p => {
      const name = p.user?.name || "";
      const email = p.user?.email || "";
      return name.toLowerCase().includes(s) || email.toLowerCase().includes(s) || (p.specialization || "").toLowerCase().includes(s);
    });
  }, [items, q]);

  async function toggle(p) {
    try {
      await api.patch(`/api/doctors/${p.user?._id}/approve`, { approved: !p.approved });
      toast.push(!p.approved ? "Approved" : "Marked pending", "success");
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Admin</div>
        <div className="text-2xl font-extrabold">Doctors</div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="max-w-md w-full">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search doctors by name, email or specialization…" />
          </div>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{filtered.length}</span></div>
        </div>

        <div className="mt-5 space-y-3">
          {filtered.map(p => (
            <div key={p._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-xl">👨‍⚕️</div>
                  <div>
                    <div className="font-extrabold text-slate-900">{p.user?.name || "Doctor"}</div>
                    <div className="text-sm text-brand-800 font-semibold">{p.specialization || "—"} • {p.experienceYears || 0} Years Exp.</div>
                    <div className="text-xs text-slate-500 mt-1">{p.user?.email}</div>
                    <div className="text-xs text-slate-500 mt-1">Fee: ₹{p.consultationFee || 0} • Rating: {p.rating || 4.5} • Qualification: {p.qualification || "—"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 border ${p.approved ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                    {p.approved ? "Approved" : "Pending"}
                  </span>
                  <Button onClick={() => toggle(p)} variant={p.approved ? "secondary" : "primary"}>
                    {p.approved ? "Unapprove" : "Approve"}
                  </Button>
                </div>
              </div>

              {p.bio ? (
                <div className="mt-4 text-sm text-slate-600">{p.bio}</div>
              ) : null}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-sm text-slate-500 py-6">No doctors found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
