import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, MapPin, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

export function TopbarSearch({ showLocationChip=true, collapsed, setCollapsed }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);
  const { user } = useAuth();
  const [locationLabel, setLocationLabel] = useState( localStorage.getItem('ms_selected_address_label') || "" );

  useEffect(() => {
    function onDown(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    function update() {
      const id = localStorage.getItem('ms_selected_address');
      let label = localStorage.getItem('ms_selected_address_label') || '';
      if ((!label || !id) && user?.addresses?.length) {
        const a = user.addresses.find(x => x._id === id) || user.addresses[0];
        if (a) label = a.city || a.label || '';
      }
      setLocationLabel(label || 'Bengaluru');
    }
    update();
    window.addEventListener('ms:addressChanged', update);
    return () => window.removeEventListener('ms:addressChanged', update);
  }, [user]);

  useEffect(() => {
    // small debounce to show the dropdown after typing
    const t = setTimeout(() => {
      if (q.trim()) setOpen(true);
      else setOpen(false);
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const sitePages = useMemo(() => ([
    { key: "home", title: "Home", subtitle: "Overview & quick actions", route: "/" },
    { key: "pharmacy", title: "Pharmacy", subtitle: "Browse medicines", route: "/pharmacy" },
    { key: "doctors", title: "Doctors", subtitle: "Find and book doctors", route: "/doctors" },
    { key: "appointments", title: "Appointments", subtitle: "Your upcoming bookings", route: "/appointments" },
    { key: "organizer", title: "Organizer", subtitle: "Daily medicine planner", route: "/organizer" },
    { key: "prescriptions", title: "Prescriptions", subtitle: "Uploaded prescriptions & OCR", route: "/prescriptions" },
    { key: "cart", title: "Cart", subtitle: "View your cart", route: "/cart" },
    { key: "orders", title: "Your Orders", subtitle: "Order history & details", route: "/orders" },
    { key: "settings", title: "Settings", subtitle: "Account settings", route: "/settings" },
  ]), []);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return sitePages.slice(0, 6).map(p => ({ title: p.title, subtitle: p.subtitle, action: () => nav(p.route) }));
    return sitePages.filter(p => p.title.toLowerCase().includes(term) || p.subtitle.toLowerCase().includes(term)).slice(0, 8).map(p => ({
      title: p.title,
      subtitle: p.subtitle,
      action: () => nav(p.route),
    }));
  }, [q, sitePages, nav]);

  const menuRef = useRef(null);
  const [iconLeft, setIconLeft] = useState(56);

  useEffect(() => {
    function updateLeft() {
      const menuW = menuRef.current?.offsetWidth || 40;
      const left = menuW + 16; // menu width + gap
      setIconLeft(left);
    }
    updateLeft();
    window.addEventListener('resize', updateLeft);
    return () => window.removeEventListener('resize', updateLeft);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div className="flex items-center gap-3">
        <div ref={menuRef}>
          <button
            onClick={() => setCollapsed && setCollapsed(s => !s)}
            className="p-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        </div>
        <div className="flex-1">
          <div className="relative">
            <Search
              size={18}
              className="text-slate-400 absolute top-1/2 -translate-y-1/2"
              style={{ left: iconLeft }}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder="Search across MedoSwift (e.g. 'P' for Pharmacy)..."
              className="w-full rounded-3xl border border-slate-200 bg-white pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 shadow-soft"
              style={{ paddingLeft: iconLeft + 26 }}
            />
          </div>
        </div>

        {showLocationChip && (
          <div className="hidden md:flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-soft">
              <MapPin size={16} className="text-brand-700" />
              {locationLabel || 'Bengaluru'}
            </div>
        )}
      </div>

      <AnimatePresence>
        {open && q.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            className="absolute z-40 mt-3 w-full rounded-3xl bg-white border border-slate-100 shadow-soft overflow-hidden"
          >
            <div className="px-5 py-3 text-xs font-semibold text-slate-400">QUICK NAVIGATION</div>
            <div className="divide-y divide-slate-100">
              {loading && <div className="px-5 py-4 text-sm text-slate-500">Searching…</div>}
              {!loading && items.length === 0 && (
                <div className="px-5 py-4 text-sm text-slate-500">No matches. Try typing a page name (e.g. Pharmacy, Doctors).</div>
              )}
              {!loading && items.map((it, idx) => (
                <button
                  key={idx}
                  onClick={() => { it.action(); setOpen(false); }}
                  className={clsx("w-full text-left px-5 py-4 hover:bg-slate-50 transition")}
                >
                  <div className="text-sm font-semibold">{it.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{it.subtitle}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
