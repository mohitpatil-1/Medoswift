import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, API_URL } from "../../app/api.js";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { useCart } from "../../app/cart/CartProvider.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function PharmacyPage() {
  const [sp] = useSearchParams();
  const initialQ = sp.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState("All");
  const [cats, setCats] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const cart = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const { user } = useAuth();
  const [sections, setSections] = useState({});

  useEffect(() => { setQ(initialQ); }, [initialQ]);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", 12);
      if (q.trim()) params.set("q", q.trim());
      if (category && category !== "All") params.set("category", category);

      const { data } = await api.get(`/api/medicines?${params.toString()}`);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setCats(data.categories || ["All"]);
    })();
  }, [q, category, page]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/sections');
        setSections(res.data.items || {});
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    // no-op: sections loaded elsewhere; promo moved to Home page
  }, []);
  useEffect(() => {
    function onDown(e) {
      if (showFilter && filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showFilter]);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / 12)), [total]);
  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
        <div>
          <div className="text-sm text-slate-500">Pharmacy</div>
          <div className="text-2xl font-extrabold">Browse medicines</div>
          {selectedCategory && (
            <div className="mt-1 text-sm text-slate-500">Category: {selectedCategory}</div>
          )}
        </div>
      </div>

      {/* Controls: placed below the heading as requested */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          <Input
            className="w-[420px] md:w-[640px] px-5 py-3 text-base shadow-soft"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
            placeholder="Search medicine…"
          />

          <Button size="sm" variant="soft" onClick={() => nav('/prescriptions')}>Scan</Button>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(s => !s)}
              className="px-3 py-2 text-sm rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              Filter
            </button>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-soft z-40 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="text-sm font-semibold mb-3">Filter by category</div>
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {cats.map(c => (
                        <button key={c} className="w-full text-left px-2 py-1 text-sm hover:bg-slate-50 rounded" onClick={() => { setCategory(c); setShowFilter(false); }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      { !selectedCategory ? (
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {cats.filter(c => c).map((c) => {
            const key = `category-${c}`;
            const img = sections[key];
            const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
            return (
              <Card key={c} className="p-4 h-44 cursor-pointer hover:shadow-md flex flex-col" onClick={() => { setSelectedCategory(c); setCategory(c); setPage(1); }}>
                <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden mt-0">
                  {imgSrc ? (
                    <img src={imgSrc} alt={c} className="max-w-full max-h-full object-contain rounded-md" />
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
                <div className="mt-3">
                  <div className="text-lg font-extrabold">{c}</div>
                </div>
              </Card>
            );
          })}
          </div>

          {/* promo removed from Pharmacy page (moved to Home) */}
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setCategory("All"); setPage(1); }}>← Back to categories</Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((m) => (
              <Card key={m._id} className="p-4 h-44">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{m.icon || "💊"}</div>
                    <div>
                      <div className="font-extrabold">{m.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.category}</div>
                      {m.prescriptionRequired && (
                        <div className="mt-2 inline-flex rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                          Prescription required
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-extrabold">₹{m.price}</div>
                </div>

                <div className="mt-4 text-sm text-slate-600 line-clamp-2">{m.description || "—"}</div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500">Stock: {m.stock}</div>

                  {(() => {
                    const cartItem = cart.items.find(i => i.medicineId === m._id);
                    const qty = cartItem?.qty || 0;

                    if (qty === 0) {
                      return (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (m.stock <= 0) return toast.push("Out of stock", "error");
                            cart.add({ medicineId: m._id, name: m.name, price: m.price }, 1);
                            toast.push("Added to cart", "success");
                          }}
                        >
                          Add
                        </Button>
                      );
                    }

                    return (
                      <div className="inline-flex items-center rounded-2xl border overflow-hidden">
                        <button
                          className="px-3 py-1 text-sm bg-white hover:bg-slate-50"
                          onClick={() => {
                            if (qty <= 1) cart.remove(m._id);
                            else cart.setQty(m._id, qty - 1);
                          }}
                        >
                          -
                        </button>
                        <div className="px-4 py-1 text-sm font-semibold">{qty}</div>
                        <button
                          className="px-3 py-1 text-sm bg-white hover:bg-slate-50"
                          onClick={() => {
                            if (qty + 1 > m.stock) return toast.push("Not enough stock", "error");
                            cart.add({ medicineId: m._id, name: m.name, price: m.price }, 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                    );
                  })()}

                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Page {page} of {pages}</div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
          <Button variant="ghost" disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
