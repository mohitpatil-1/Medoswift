import React, { useEffect, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function DoctorAppointmentsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);

  async function load() {
    const { data } = await api.get("/api/appointments/mine");
    setItems(data.items || []);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    await api.patch(`/api/appointments/${id}/cancel`);
    toast.push("Cancelled", "success");
    await load();
    // notify other parts of the app (dashboard) that appointments changed
    try { window.dispatchEvent(new CustomEvent('appointments:updated')); } catch {}
  }
  async function complete(id) {
    await api.patch(`/api/appointments/${id}/complete`);
    toast.push("Marked as completed", "success");
    load();
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm text-slate-500">Doctor</div>
        <div className="text-2xl font-extrabold">Appointments</div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <Card className="p-6 text-sm text-slate-600">No appointments.</Card>}
        {items.map((a) => (
          <Card key={a._id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-extrabold">{a.user?.name}</div>
                <div className="text-sm text-slate-600 mt-1">{new Date(a.slot?.start).toLocaleString()} • {a.mode}</div>
                {a.meetingLink && <a className="text-sm font-semibold text-brand-800 mt-1 inline-block" href={a.meetingLink} target="_blank" rel="noreferrer">Join meeting</a>}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs rounded-full px-2 py-1 border border-slate-200 bg-slate-50 text-slate-600">
                  {a.status}
                </div>
                {a.status === "confirmed" && (
                  <>
                    <Button variant="ghost" onClick={() => cancel(a._id)}>Cancel</Button>
                    <Button variant="soft" onClick={() => complete(a._id)}>Complete</Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
