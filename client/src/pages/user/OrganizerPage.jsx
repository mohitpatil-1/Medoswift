import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import ClockPicker from "../../components/ui/ClockPicker2.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

const days = [
  { v: 1, t: "Mon" }, { v: 2, t: "Tue" }, { v: 3, t: "Wed" }, { v: 4, t: "Thu" }, { v: 5, t: "Fri" }, { v: 6, t: "Sat" }, { v: 0, t: "Sun" },
];

export default function OrganizerPage() {
  const toast = useToast();
  const [sub, setSub] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [meds, setMeds] = useState([]);

  const [medicineId, setMedicineId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("1 tab");
  const [timeOfDay, setTimeOfDay] = useState("08:00");
  const [daysOfWeek, setDaysOfWeek] = useState([1,2,3,4,5,6,0]);

  const lastFiredRef = useRef("");

  async function load() {
    const s = await api.get("/api/subscriptions/me");
    setSub(s.data.subscription);
    const r = await api.get("/api/reminders");
    setReminders(r.data.reminders || []);
    const m = await api.get("/api/medicines?limit=50&page=1");
    setMeds(m.data.items || []);
  }

  useEffect(() => { load(); }, []);

  const subActive = useMemo(() => {
    if (!sub) return false;
    if (sub.status !== "active") return false;
    return new Date(sub.endAt).getTime() >= Date.now();
  }, [sub]);

  async function startSub() {
    try {
      const { data } = await api.post("/api/subscriptions/start", { plan: "OrganizerMonthly" });
      setSub(data.subscription);
      toast.push("Organizer activated for 1 month", "success");
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  async function addReminder() {
    try {
      const med = meds.find(x => x._id === medicineId);
      const payload = {
        medicineId: medicineId || undefined,
        medicineName: med ? med.name : (medicineName || "Medicine"),
        dosage,
        timeOfDay,
        daysOfWeek,
      };
      const { data } = await api.post("/api/reminders", payload);
      setReminders((s) => [data.reminder, ...s]);
      toast.push("Reminder created", "success");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed";
      toast.push(msg.includes("subscription") ? "Organizer subscription required" : msg, "error");
    }
  }

  async function toggleReminder(id, active) {
    const { data } = await api.patch(`/api/reminders/${id}/toggle`, { active });
    setReminders((s) => s.map(r => r._id === id ? data.reminder : r));
  }

  async function deleteReminder(id) {
    await api.delete(`/api/reminders/${id}`);
    setReminders((s) => s.filter(r => r._id !== id));
    toast.push("Deleted", "success");
  }

  // In-app reminder notifier (works while app is open)
  useEffect(() => {
    if (!subActive) return;

    const timer = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,"0");
      const mm = String(now.getMinutes()).padStart(2,"0");
      const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${hh}:${mm}`;
      if (lastFiredRef.current === key) return;

      const dow = now.getDay(); // 0=Sun
      const due = reminders.filter(r => r.active && r.timeOfDay === `${hh}:${mm}` && (r.daysOfWeek || []).includes(dow));
      if (due.length > 0) {
        lastFiredRef.current = key;
        notify(due.map(d => `${d.medicineName} (${d.dosage || ""})`).join(", "));
      }
    }, 20 * 1000);

    return () => clearInterval(timer);
  }, [reminders, subActive]);

  async function notify(body) {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") await Notification.requestPermission();
      if (Notification.permission === "granted") {
        new Notification("MedoSwift Reminder", { body });
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Organizer</div>
        <div className="text-2xl font-extrabold">Subscription-based daily planner</div>
      </div>

      {!subActive && (
        <Card className="p-6 bg-gradient-to-br from-brand-50 to-white">
          <div className="text-sm text-slate-600">Organizer is locked</div>
          <div className="mt-1 text-xl font-extrabold">Activate monthly subscription</div>
          <div className="mt-2 text-sm text-slate-600">
            Get dose reminders and a simple medication routine planner.
          </div>
          <Button className="mt-4" onClick={startSub}>Start Organizer Monthly</Button>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Create reminder</div>
            <div className="text-lg font-extrabold">Add a dose schedule</div>
          </div>
          <div className="text-xs text-slate-500">
            Works as in-app notification while the web app is open.
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Medicine (catalog)</div>
            <Select value={medicineId} onChange={(e) => setMedicineId(e.target.value)}>
              <option value="">— select from pharmacy —</option>
              {meds.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Or type medicine name</div>
            <Input value={medicineName} onChange={(e) => setMedicineName(e.target.value)} placeholder="e.g., Metformin" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Dosage</div>
            <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="1 tab / 5 ml" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Time</div>
            <div>
              {/* ClockPicker: custom clock UI to pick hour and minute */}
              <ClockPicker value={timeOfDay} onChange={(v) => setTimeOfDay(v)} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 mb-2">Days</div>
          <div className="flex flex-wrap gap-2">
            {days.map(d => {
              const on = daysOfWeek.includes(d.v);
              return (
                <button
                  key={d.v}
                  onClick={() => setDaysOfWeek((s) => on ? s.filter(x => x !== d.v) : [...s, d.v])}
                  className={`px-3 py-2 rounded-2xl text-sm border ${on ? "bg-brand-50 border-brand-100 text-brand-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {d.t}
                </button>
              );
            })}
          </div>
        </div>

        <Button className="mt-5" onClick={addReminder}>Create reminder</Button>
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-700">Your reminders</div>
        {reminders.length === 0 && <Card className="p-6 text-sm text-slate-600">No reminders yet.</Card>}
        {reminders.map((r) => (
          <Card key={r._id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-extrabold">{r.medicineName}</div>
                <div className="text-sm text-slate-600 mt-1">{r.timeOfDay} • {r.dosage || ""}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Days: {(r.daysOfWeek || []).map(v => days.find(d=>d.v===v)?.t).join(", ")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={r.active ? "soft" : "ghost"} onClick={() => toggleReminder(r._id, !r.active)}>
                  {r.active ? "Active" : "Paused"}
                </Button>
                <Button variant="ghost" onClick={() => deleteReminder(r._id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
