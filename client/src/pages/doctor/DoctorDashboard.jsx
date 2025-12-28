import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { api } from "../../app/api.js";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [appts, setAppts] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const p = await api.get("/api/doctors/me");
        setProfile(p.data.profile);
      } catch {
        setProfile(null);
      }
      const a = await api.get("/api/appointments/mine");
      setAppts(a.data.items || []);
    })();
    function onUpdated() {
      (async () => {
        try {
          const a = await api.get("/api/appointments/mine");
          setAppts(a.data.items || []);
        } catch (e) {
          // ignore
        }
      })();
    }
    window.addEventListener('appointments:updated', onUpdated);
    return () => window.removeEventListener('appointments:updated', onUpdated);
  }, []);

  const upcoming = useMemo(() => appts.filter(a => a.status === "confirmed").slice(0, 5), [appts]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Doctor</div>
        <div className="text-2xl font-extrabold">Dashboard</div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-slate-500">Approval</div>
          <div className="mt-2 text-2xl font-extrabold">{profile?.approved ? "Approved" : "Pending"}</div>
          <div className="mt-2 text-sm text-slate-600">Only approved doctors can publish slots.</div>
          <Button className="mt-4" variant="ghost" onClick={() => nav("/doctor/profile")}>Edit profile</Button>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-500">Appointments</div>
          <div className="mt-2 text-2xl font-extrabold">{appts.length}</div>
          <div className="mt-2 text-sm text-slate-600">Total appointments assigned to you.</div>
          <Button className="mt-4" variant="ghost" onClick={() => nav("/doctor/appointments")}>View</Button>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-brand-50 to-white">
          <div className="text-sm text-slate-500">Availability</div>
          <div className="mt-2 text-2xl font-extrabold">Publish your slots</div>
          <div className="mt-2 text-sm text-slate-600">Patients can book only from your published slots.</div>
          <Button className="mt-4" variant="soft" onClick={() => nav("/doctor/slots")}>Add slots</Button>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm text-slate-500">Upcoming</div>
            <div className="text-xl font-extrabold mt-1">Next appointments</div>
          </div>
          <Button variant="ghost" onClick={() => nav("/doctor/appointments")}>Manage</Button>
        </div>

        <div className="mt-4 space-y-3">
          {upcoming.length === 0 && <div className="text-sm text-slate-600">No upcoming appointments.</div>}
          {upcoming.map(a => (
            <div key={a._id} className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{a.user?.name}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(a.slot?.start).toLocaleString()} • {a.mode}</div>
              </div>
              <Button size="sm" variant="soft" onClick={() => nav("/doctor/prescriptions")}>Issue Rx</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
