import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

function KpiCard({ label, value, hint }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  );
}

function formatMoney(v) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
  } catch {
    return `₹${Math.round(v || 0)}`;
  }
}

export default function AdminDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/api/admin/analytics");
      setData(data);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to load analytics", "error");
    }
  }

  useEffect(() => { load(); }, []);

  const daily = useMemo(() => {
    const items = data?.daily || [];
    return items.map(d => ({
      day: d._id?.slice(5) || d._id,
      orders: d.orders,
      revenue: Math.round(d.revenue || 0),
    }));
  }, [data]);

  if (!data) return <div className="text-sm text-slate-600">Loading…</div>;

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Admin</div>
        <div className="text-2xl font-extrabold">Analytics dashboard</div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard label="Patients" value={k.users} />
        <KpiCard label="Doctors" value={k.doctors} />
        <KpiCard label="Medicines" value={k.medicines} />
        <KpiCard label="Orders" value={k.orders} />
        <KpiCard label="Revenue" value={formatMoney(k.revenue)} hint="All-time (excluding cancelled)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Orders (7 days)</div>
              <div className="text-xs text-slate-500">Daily order volume</div>
            </div>
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <div className="text-sm font-semibold">Revenue (7 days)</div>
            <div className="text-xs text-slate-500">Daily revenue trend</div>
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
