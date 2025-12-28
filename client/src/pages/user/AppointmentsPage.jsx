import React, { useEffect, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { format } from "date-fns";

export default function AppointmentsPage() {
  const [items, setItems] = useState([]);
  const toast = useToast();

  async function load() {
    const { data } = await api.get("/api/appointments/mine");
    setItems(data.items || []);
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    try {
      await api.patch(`/api/appointments/${id}/cancel`);
      toast.push("Appointment cancelled", "success");
      await load();
      try { window.dispatchEvent(new CustomEvent('appointments:updated')); } catch {}
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm text-slate-500">Appointments</div>
        <div className="text-2xl font-extrabold">Your appointments</div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <Card className="p-6 text-sm text-slate-600">No appointments yet. Book from Doctors.</Card>}
        {items.map((a) => (
          <Card key={a._id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-extrabold">{a.doctorUser?.name}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {format(new Date(a.slot?.start), "dd MMM yyyy, hh:mm a")} • {a.mode}
                </div>
                {a.meetingLink && (
                  <a className="text-sm text-brand-800 font-semibold mt-2 inline-block" href={a.meetingLink} target="_blank" rel="noreferrer">
                    Join meeting
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs rounded-full px-2 py-1 border border-slate-200 bg-slate-50 text-slate-600">
                  {a.status}
                </div>
                {a.status !== "cancelled" && (
                  <Button variant="ghost" onClick={() => cancel(a._id)}>Cancel</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
