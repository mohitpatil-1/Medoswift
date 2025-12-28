import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function DoctorPrescriptionsPage() {
  const toast = useToast();
  const [mine, setMine] = useState([]);
  const [meds, setMeds] = useState([]);

  const [appointmentId, setAppointmentId] = useState("");
  const [rows, setRows] = useState([{ medicineId: "", name: "", dosage: "", frequency: "", durationDays: 0, notes: "" }]);

  async function load() {
    const p = await api.get("/api/prescriptions/mine");
    setMine(p.data.items || []);
    const m = await api.get("/api/medicines?limit=50&page=1");
    setMeds(m.data.items || []);
  }
  useEffect(() => { load(); }, []);

  const canIssue = useMemo(() => appointmentId.trim() && rows.some(r => (r.name || r.medicineId)), [appointmentId, rows]);

  function setRow(i, patch) {
    setRows((s) => s.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  function addRow() {
    setRows((s) => [...s, { medicineId: "", name: "", dosage: "", frequency: "", durationDays: 0, notes: "" }]);
  }

  async function issue() {
    try {
      const items = rows
        .filter(r => r.medicineId || (r.name && r.name.trim().length >= 2))
        .map(r => ({
          medicineId: r.medicineId || undefined,
          name: r.name || meds.find(m => m._id === r.medicineId)?.name || "Medicine",
          dosage: r.dosage,
          frequency: r.frequency,
          durationDays: Number(r.durationDays || 0),
          notes: r.notes,
        }));

      const { data } = await api.post("/api/prescriptions/issue", { appointmentId, items });
      toast.push("Prescription issued", "success");
      setAppointmentId("");
      setRows([{ medicineId: "", name: "", dosage: "", frequency: "", durationDays: 0, notes: "" }]);
      setMine((s) => [data.prescription, ...s]);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Doctor</div>
        <div className="text-2xl font-extrabold">Prescriptions</div>
      </div>

      <Card className="p-6">
        <div className="text-sm font-semibold">Issue prescription</div>
        <div className="text-xs text-slate-500 mt-1">Use the Appointment ID from your appointments list.</div>

        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 mb-2">Appointment ID</div>
          <Input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} placeholder="Paste appointment _id" />
        </div>

        <div className="mt-5 space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 p-4 grid md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-slate-500 mb-2">Medicine</div>
                <Select value={r.medicineId} onChange={(e) => {
                  const mid = e.target.value;
                  const med = meds.find(m => m._id === mid);
                  setRow(i, { medicineId: mid, name: med?.name || r.name });
                }}>
                  <option value="">— select —</option>
                  {meds.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </Select>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-slate-500 mb-2">Or type name</div>
                <Input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="Medicine name" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Dosage</div>
                <Input value={r.dosage} onChange={(e) => setRow(i, { dosage: e.target.value })} placeholder="1 tab" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Days</div>
                <Input type="number" value={r.durationDays} onChange={(e) => setRow(i, { durationDays: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-3">
                <div className="text-xs font-semibold text-slate-500 mb-2">Frequency</div>
                <Input value={r.frequency} onChange={(e) => setRow(i, { frequency: e.target.value })} placeholder="Morning / Night / 1-0-1" />
              </div>
              <div className="md:col-span-3">
                <div className="text-xs font-semibold text-slate-500 mb-2">Notes</div>
                <Input value={r.notes} onChange={(e) => setRow(i, { notes: e.target.value })} placeholder="After food…" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={addRow}>Add row</Button>
          <Button onClick={issue} disabled={!canIssue}>Issue</Button>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-700">Your issued prescriptions</div>
        {mine.length === 0 && <Card className="p-6 text-sm text-slate-600">No prescriptions yet.</Card>}
        {mine.map(p => (
          <Card key={p._id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold">Rx #{p._id.slice(-6).toUpperCase()}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs rounded-full px-2 py-1 border border-slate-200 bg-slate-50 text-slate-600">
                {p.source}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(p.items || []).map((it, idx) => (
                <span key={idx} className="text-xs rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-slate-700">
                  {it.name}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
