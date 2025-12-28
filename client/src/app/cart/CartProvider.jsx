import React, { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ms_cart") || "[]"); } catch { return []; }
  });

  function persist(next) {
    setItems(next);
    localStorage.setItem("ms_cart", JSON.stringify(next));
  }

  const value = useMemo(() => ({
    items,
    add(item, qty = 1) {
      const next = [...items];
      const idx = next.findIndex(x => x.medicineId === item.medicineId);
      if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + qty };
      else next.push({ ...item, qty });
      persist(next);
    },
    remove(medicineId) {
      persist(items.filter(i => i.medicineId !== medicineId));
    },
    setQty(medicineId, qty) {
      const next = items.map(i => i.medicineId === medicineId ? { ...i, qty: Math.max(1, qty) } : i);
      persist(next);
    },
    clear() { persist([]); },
    subtotal() { return items.reduce((s, i) => s + i.price * i.qty, 0); },
    count() { return items.reduce((s, i) => s + i.qty, 0); },
  }), [items]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
