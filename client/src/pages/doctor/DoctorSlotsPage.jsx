import React, { useState } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { api } from "../../app/api.js";

function addMinutes(d, m) { return new Date(d.getTime() + m * 60000); }

export default function DoctorSlotsPage() {
  const toast = useToast();
  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,"0");
    const dd = String(d.getDate()).padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("13:00");
  const [slotMins, setSlotMins] = useState(15);
  const [loading, setLoading] = useState(false);

  async function createSlots() {
    try {
      setLoading(true);
      const startDt = new Date(`${date}T${start}:00`);
      const endDt = new Date(`${date}T${end}:00`);
      if (endDt <= startDt) throw new Error("End must be after start");
      const slots = [];
      let cur = startDt;
      while (cur < endDt) {
        const nxt = addMinutes(cur, slotMins);
        if (nxt > endDt) break;
        slots.push({ start: cur.toISOString(), end: nxt.toISOString() });
        cur = nxt;
      }
      if (slots.length === 0) throw new Error("No slots generated");
      await api.post("/api/slots", { slots });
      toast.push(`Created ${slots.length} slots`, "success");
    } catch (e) {
      toast.push(e?.response?.data?.message || e.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Availability</div>
        <div className="text-2xl font-extrabold">Create appointment slots</div>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Date</div>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Slot length (mins)</div>
            <Input type="number" value={slotMins} min={5} max={120} onChange={(e) => setSlotMins(Number(e.target.value))} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Start time</div>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">End time</div>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <Button className="mt-5" onClick={createSlots} disabled={loading}>
          {loading ? "Creating…" : "Create slots"}
        </Button>

        <div className="mt-4 text-xs text-slate-500">
          Slots are generated in a batch from Start → End at the selected interval. Duplicate slots are ignored.
        </div>
      </Card>
    </div>
  );
}
