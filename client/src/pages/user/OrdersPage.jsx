import React, { useEffect, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  async function load() {
    const { data } = await api.get("/api/orders/mine");
    setItems(data.items || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-slate-500">Orders</div>
          <div className="text-2xl font-extrabold">Your orders</div>
        </div>
        <Button variant="ghost" onClick={() => nav("/pharmacy")}>Shop more</Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <Card className="p-6 text-sm text-slate-600">No orders yet.</Card>}
        {items.map((o) => (
          <Card key={o._id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-extrabold">Order #{o._id.slice(-6).toUpperCase()}</div>
                <div className="text-sm text-slate-600 mt-1">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">{(o.items || []).length} items • Total ₹{o.total}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs rounded-full px-2 py-1 border border-slate-200 bg-slate-50 text-slate-600">
                  {o.status}
                </div>
                <Button onClick={() => nav(`/orders/${o._id}`)}>Track</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
