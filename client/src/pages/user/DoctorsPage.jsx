import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, API_URL } from "../../app/api.js";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { format } from "date-fns";

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DoctorsPage() {
  const [sp] = useSearchParams();
  const initialQ = sp.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [items, setItems] = useState([]);
  const [specializations, setSpecializations] = useState(["All"]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [sections, setSections] = useState({});
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [mode, setMode] = useState("online");
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/api/doctors");
      setItems(data.items || []);
    })();
  }, []);

  useEffect(() => {
    // derive specializations from loaded doctors
    const specs = Array.from(new Set(items.map(d => d.specialization).filter(Boolean)));
    setSpecializations(["All", ...specs]);
  }, [items]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/sections');
        setSections(res.data.items || {});
      } catch (e) {}
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = items;
    if (selectedSpecialization && selectedSpecialization !== "All") {
      list = list.filter(d => d.specialization === selectedSpecialization);
    }
    if (!term) return list;
    return list.filter(d => 
      d.name?.toLowerCase().includes(term) ||
      d.specialization?.toLowerCase().includes(term)
    );
  }, [q, items, selectedSpecialization]);

  async function openBooking(doc) {
    setSelected(doc);
    setOpen(true);
    await loadSlots(doc.id, date);
  }

  async function loadSlots(doctorId, dateStr) {
    const { data } = await api.get(`/api/slots?doctorId=${doctorId}&date=${dateStr}`);
    setSlots(data.slots || []);
  }

  async function book(slotId) {
    try {
      await api.post("/api/appointments/book", { doctorId: selected.id, slotId, mode });
      toast.push("Appointment booked!", "success");
      await loadSlots(selected.id, date);
      setOpen(false);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Booking failed", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
        <div>
          <div className="text-sm text-slate-500">Doctors</div>
          <div className="text-2xl font-extrabold">Find a doctor</div>
        </div>
        <div className="w-full md:w-[360px]">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or specialization…" />
        </div>
      </div>

      { !selectedSpecialization ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* All card first */}
          {(() => {
            const s = "All";
            const key = `specialization-${s}`;
            const img = sections[key];
            const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
            return (
              <Card key={s} className="p-6 aspect-square cursor-pointer hover:shadow-md flex flex-col" onClick={() => { setSelectedSpecialization(s); }}>
                <div className="relative w-full flex-1 flex items-center justify-center -mx-6 mt-0">
                  {imgSrc ? (
                    <img src={imgSrc} alt={s} className="max-w-full max-h-full object-contain rounded-md" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                  )}

                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onClick={(e) => e.stopPropagation()} onChange={async (ev) => {
                        const f = ev.target.files?.[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append('file', f);
                        fd.append('key', key);
                        try {
                          await api.post('/api/sections/upload', fd);
                          const res = await api.get('/api/sections');
                          setSections(res.data.items || {});
                          toast.push('Uploaded', 'success');
                        } catch (err) { toast.push('Upload failed', 'error'); }
                      }} />
                    </div>
                  )}

                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">{s}</div>
                </div>
              </Card>
            );
          })()}

          {specializations.filter(s => s && s !== "All").map((s) => {
            const key = `specialization-${s}`;
            const img = sections[key];
            const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
            return (
              <Card key={s} className="p-6 aspect-square cursor-pointer hover:shadow-md flex flex-col" onClick={() => { setSelectedSpecialization(s); }}>
                <div className="relative w-full flex-1 flex items-center justify-center -mx-6 mt-0">
                  {imgSrc ? (
                    <img src={imgSrc} alt={s} className="max-w-full max-h-full object-contain rounded-md" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                  )}

                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onClick={(e) => e.stopPropagation()} onChange={async (ev) => {
                        const f = ev.target.files?.[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append('file', f);
                        fd.append('key', key);
                        try {
                          await api.post('/api/sections/upload', fd);
                          const res = await api.get('/api/sections');
                          setSections(res.data.items || {});
                          toast.push('Uploaded', 'success');
                        } catch (err) { toast.push('Upload failed', 'error'); }
                      }} />
                    </div>
                  )}

                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">{s}</div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-extrabold">{d.name}</div>
                <div className="text-xs text-slate-500 mt-1">{d.specialization} • {d.experienceYears} yrs</div>
                <div className="text-xs text-slate-500 mt-1">Rating: {d.rating} • Fee: ₹{d.consultationFee}</div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">👨‍⚕️</div>
            </div>

            <div className="mt-4 text-sm text-slate-600 line-clamp-3">{d.bio || "—"}</div>

            <Button className="mt-4 w-full" onClick={() => openBooking(d)}>Book</Button>
          </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={selected ? `Book: ${selected.name}` : "Book appointment"}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Date</div>
                <Input type="date" value={date} onChange={async (e) => { setDate(e.target.value); await loadSlots(selected.id, e.target.value); }} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Mode</div>
                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="online">Online</option>
                  <option value="inperson">In person</option>
                </Select>
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-700">Available slots</div>
            <div className="grid grid-cols-2 gap-2">
              {slots.length === 0 && <div className="text-sm text-slate-500">No slots for this date. Try another date.</div>}
              {slots.map(s => (
                <Button key={s._id} variant="ghost" onClick={() => book(s._id)}>
                  {format(new Date(s.start), "hh:mm a")}
                </Button>
              ))}
            </div>

            <div className="text-xs text-slate-500">Tip: Doctors can add availability from their dashboard.</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
