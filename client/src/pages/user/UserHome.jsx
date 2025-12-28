import React from "react";
import { Card } from "../../components/ui/Card.jsx";
import { useNavigate } from "react-router-dom";
import { Pill, Stethoscope, CalendarClock, NotebookPen, FileText, Package, ShoppingCart } from "lucide-react";
import { useCart } from "../../app/cart/CartProvider.jsx";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useEffect, useState, useMemo } from "react";
import { api, API_URL } from "../../app/api.js";
import BannerCarousel from "../../components/layout/BannerCarousel.jsx";

export default function UserHome() {
  const nav = useNavigate();
  const cart = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const topRow = [
    { to: "/pharmacy", key: "pharmacy", icon: Pill, label: "Pharmacy" },
    { to: "/doctors", key: "doctors", icon: Stethoscope, label: "Doctors" },
    { to: "/appointments", key: "appointments", icon: CalendarClock, label: "Appointments" },
    { to: "/organizer", key: "organizer", icon: NotebookPen, label: "Organizer" },
  ];

  const middleRow = [
    { to: "/prescriptions", key: "prescriptions", icon: FileText, label: "Prescriptions" },
    { to: "/orders", key: "orders", icon: Package, label: "Your Orders" },
    { to: "/cart", key: "cart", icon: ShoppingCart, label: "Cart", isCart: true },
  ];

  const [sections, setSections] = useState({});
  const [promoIndex, setPromoIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  const promoImages = useMemo(() => {
    const imgs = [];
    // support up to 5 promo-circle images: promo-circle-1 .. promo-circle-5
    for (let i = 1; i <= 5; i++) {
      const key = `promo-circle-${i}`;
      const s = sections[key];
      if (s) imgs.push(s.startsWith('http') ? s : `${API_URL}${s}`);
    }
    // Only use uploaded promos; do not fall back to static files.
    return imgs.filter(Boolean);
  }, [sections]);

  useEffect(() => {
    if (!promoImages || promoImages.length === 0) {
      setPromoIndex(0);
      return;
    }
    if (promoImages.length > 1) {
      const t = setInterval(() => setPromoIndex(i => (i + 1) % promoImages.length), 4200);
      return () => clearInterval(t);
    }
    setPromoIndex(0);
  }, [promoImages]);

  useEffect(() => {
    function onResize() { setIsDesktop(window.innerWidth >= 768); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/sections');
        setSections(res.data.items || {});
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const CARD_STYLE = "p-4 h-44 cursor-pointer hover:shadow-md flex flex-col";

  return (
    <div className="space-y-6">
      <div className="pt-4">
        <BannerCarousel />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {topRow.map(b => {
          const Icon = b.icon;
          const img = sections[b.key];
          const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
          return (
            <Card key={b.to} className={CARD_STYLE} onClick={() => nav(b.to)}>
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden mt-0">
                {imgSrc ? (
                  <img src={imgSrc} alt={b.label} className="max-w-full max-h-full object-contain rounded-md" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                )}

                {user?.role === 'admin' && (
                  <div className="absolute top-2 right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (ev) => {
                        const f = ev.target.files?.[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append('file', f);
                        fd.append('key', b.key);
                        try {
                          await api.post('/api/sections/upload', fd);
                          const res = await api.get('/api/sections');
                          setSections(res.data.items || {});
                          toast.push('Uploaded', 'success');
                        } catch (err) {
                          toast.push('Upload failed', 'error');
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="text-lg font-extrabold">{b.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {middleRow.map(b => {
          const Icon = b.icon;
          const img = sections[b.key];
          const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;

          // For cart use the same image logic as other cards so uploaded JPG shows up
          return (
            <Card key={b.to} className={CARD_STYLE} onClick={() => nav(b.to)}>
              <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden mt-0">
                {imgSrc ? (
                  <img src={imgSrc} alt={b.label} className="max-w-full max-h-full object-contain rounded-md" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    {b.isCart ? <ShoppingCart size={48} className="text-slate-200" /> : 'Waiting for image'}
                  </div>
                )}

                {user?.role === 'admin' && (
                  <div className="absolute top-2 right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (ev) => {
                        const f = ev.target.files?.[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append('file', f);
                        fd.append('key', b.key);
                        try {
                          await api.post('/api/sections/upload', fd);
                          const res = await api.get('/api/sections');
                          setSections(res.data.items || {});
                          toast.push('Uploaded', 'success');
                        } catch (err) {
                          toast.push('Upload failed', 'error');
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="text-lg font-extrabold">{b.label}</div>
                {b.isCart && <div className="text-sm text-slate-600">{cart.count()} items</div>}
              </div>
            </Card>
          );
        })}
          </div>

          {/* Absolutely positioned promo circle beside the Cart card */}
          <div className={`promo-card-wrap shift-right absolute right-20 top-1/2 -translate-y-1/2 ${isDesktop ? 'flex' : 'hidden'}`}>
            <div className="promo-deco promo-deco-left" aria-hidden>
              <span className="star" aria-hidden>⭐</span>
            </div>
            <div className="promo-circle" aria-hidden>
              {promoImages.length ? (
                promoImages.map((src, i) => (
                  <img key={src} src={src} alt={`promo-${i}`} loading="lazy" width="200" height="200" className={i === promoIndex ? 'active' : ''} />
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">No promos</div>
              )}
            </div>
            <div className="promo-deco promo-deco-right" aria-hidden>
              <span className="star" aria-hidden>⭐</span>
            </div>
          </div>
        </div>
      {/* Static banner moved to AppShell so it spans the whole viewport including sidebar */}
    </div>
  );
}
