import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import OrderMap from "../../components/maps/OrderMap.jsx";
import { getSocket } from "../../app/socket.js";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [track, setTrack] = useState(null);

  async function load() {
    const { data } = await api.get(`/api/orders/${id}`);
    setOrder(data.order);
    const t = await api.get(`/api/orders/${id}/track`);
    setTrack(t.data);
  }

  useEffect(() => {
    load().catch(() => toast.push("Failed to load order", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Real-time socket updates
  useEffect(() => {
    const s = getSocket();
    s.emit("join", { rooms: [`order:${id}`] });

    function onUpdate(payload) {
      if (payload.orderId !== id) return;
      setTrack((prev) => prev ? { ...prev, status: payload.status, timeline: payload.timeline || prev.timeline } : prev);
    }
    function onTrack(payload) {
      if (payload.orderId !== id) return;
      setTrack((prev) => prev ? { ...prev, courier: payload.courier || prev.courier, etaMinutes: payload.etaMinutes ?? prev.etaMinutes } : prev);
    }
    s.on("order:update", onUpdate);
    s.on("order:track", onTrack);

    return () => {
      s.off("order:update", onUpdate);
      s.off("order:track", onTrack);
      s.emit("leave", { rooms: [`order:${id}`] });
    };
  }, [id]);

  const userLatLng = useMemo(() => {
    const a = track?.shippingAddress;
    if (!a) return null;
    if (typeof a.lat === "number" && typeof a.lng === "number") return [a.lat, a.lng];
    return [12.9716, 77.5946];
  }, [track]);

  const courierLatLng = useMemo(() => {
    const c = track?.courier?.location;
    if (!c) return null;
    if (typeof c.lat === "number" && typeof c.lng === "number") return [c.lat, c.lng];
    return null;
  }, [track]);

  if (!order || !track) return <div className="p-2 text-sm text-slate-600">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">Order tracking</div>
          <div className="text-2xl font-extrabold">Order #{order._id.slice(-6).toUpperCase()}</div>
          <div className="mt-1 text-sm text-slate-600">Status: <span className="font-semibold">{track.status}</span> • ETA: ~{track.etaMinutes} min</div>
        </div>
        <Button variant="ghost" onClick={() => load().then(() => toast.push("Refreshed", "success"))}>Refresh</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Live map</div>
            <div className="text-xs text-slate-500">
              Tile source: {import.meta.env.VITE_MAPBOX_TOKEN ? "Mapbox (fallback OSM)" : "OSM (default)"}
            </div>
          </div>
          <div className="mt-4">
            {/* ✅ Leaflet + OSM fallback default */}
            <OrderMap userLatLng={userLatLng} courierLatLng={courierLatLng} height={360} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-xs text-slate-500">Courier</div>
              <div className="font-semibold mt-1">{track.courier?.name || "—"}</div>
              <div className="text-xs text-slate-500 mt-1">{track.courier?.phone || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-xs text-slate-500">Delivery to</div>
              <div className="font-semibold mt-1">{track.shippingAddress?.label || "Address"}</div>
              <div className="text-xs text-slate-500 mt-1">{track.shippingAddress?.city || ""} {track.shippingAddress?.pincode || ""}</div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-sm font-semibold">Items</div>
            <div className="mt-3 space-y-2">
              {(order.items || []).map((it, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-xs text-slate-500">{it.qty} × ₹{it.price}</div>
                  </div>
                  <div className="font-extrabold">₹{it.qty * it.price}</div>
                </div>
              ))}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between mt-2"><span>Delivery</span><span>₹{order.deliveryFee}</span></div>
                <div className="flex justify-between mt-2 font-extrabold"><span>Total</span><span>₹{order.total}</span></div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">Timeline</div>
            <div className="mt-3 space-y-2">
              {(track.timeline || []).slice().reverse().map((t, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <div className="font-semibold">{t.status}</div>
                  <div className="text-xs text-slate-500">{new Date(t.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
