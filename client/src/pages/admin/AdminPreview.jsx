import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Home, Pill, Stethoscope, CalendarClock, NotebookPen, FileText, Package, ShoppingCart, Settings } from "lucide-react";
import { api, API_URL } from "../../app/api.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { useAuth } from "../../app/auth/AuthProvider.jsx";

export default function AdminPreview() {
  const [sections, setSections] = useState({});
  const [categories, setCategories] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const toast = useToast();
  const { user } = useAuth();

  const userItems = [
    { to: "/", key: "home", label: "Home", icon: Home },
    { to: "/pharmacy", key: "pharmacy", label: "Pharmacy", icon: Pill },
    { to: "/doctors", key: "doctors", label: "Doctors", icon: Stethoscope },
    { to: "/appointments", key: "appointments", label: "Appointments", icon: CalendarClock },
    { to: "/organizer", key: "organizer", label: "Organizer", icon: NotebookPen },
    { to: "/prescriptions", key: "prescriptions", label: "Prescriptions", icon: FileText },
    { to: "/orders", key: "orders", label: "Your Orders", icon: Package },
    { to: "/settings", key: "settings", label: "Settings", icon: Settings },
    { to: "/cart", key: "cart", label: "Cart", icon: ShoppingCart },
  ];

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get('/api/sections');
        setSections(s.data.items || {});
      } catch (e) {}

      try {
        const meds = await api.get('/api/medicines?page=1&limit=1');
        setCategories(meds.data.categories || []);
      } catch (e) {}

      try {
        const docs = await api.get('/api/doctors');
        const specs = Array.from(new Set((docs.data.items || []).map(d => d.specialization).filter(Boolean)));
        setSpecializations(specs);
      } catch (e) {}
    })();
  }, []);

  async function uploadFile(key, file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('key', key);
    try {
      await api.post('/api/sections/upload', fd);
      const res = await api.get('/api/sections');
      setSections(res.data.items || {});
      toast.push('Uploaded', 'success');
    } catch (err) {
      toast.push('Upload failed', 'error');
    }
  }

  async function updateText(key, value) {
    try {
      await api.post('/api/sections/update', { key, value });
      const res = await api.get('/api/sections');
      setSections(res.data.items || {});
      toast.push('Saved', 'success');
    } catch (err) {
      toast.push('Save failed', 'error');
    }
  }

  const CARD_STYLE = "p-6 h-64 cursor-pointer flex flex-col";

  return (
    <div className="space-y-6">
      <div>
        <div className="text-base font-semibold mb-2">Home banners</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => {
            const key = `banner-${n}`;
            const img = sections[key];
            const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
            return (
              <Card key={key} className={CARD_STYLE}>
                <div className="relative w-full">
                  {imgSrc ? (
                    <img src={imgSrc} alt={key} className="w-full h-36 object-cover rounded-md -mx-6 mt-0" />
                  ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(key, f); }} />
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">Banner {n}</div>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Static full-width banner (Home)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card className={CARD_STYLE}>
              <div className="relative w-full">
                {sections['static-banner'] ? (
                  <img src={sections['static-banner'].startsWith('http') ? sections['static-banner'] : `${API_URL}${sections['static-banner']}`} alt="static-banner" className="w-full h-36 object-cover rounded-md -mx-6 mt-0" />
                ) : (
                  <div className="h-36 flex items-center justify-center text-sm text-slate-400">Static banner preview</div>
                )}
                {user?.role === 'admin' && (
                  <div className="absolute top-2 right-2">
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile('static-banner', f); }} />
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <div className="text-xl font-extrabold">Static Banner</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div>
        <div className="text-base font-semibold mb-2">Contact & Social links</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Contact email</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded border px-3 py-2" defaultValue={sections.contact_email || ''} id="contact_email" />
              <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={() => updateText('contact_email', document.getElementById('contact_email').value)}>Save</button>
            </div>

            <label className="text-sm font-medium">Whatsapp number</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded border px-3 py-2" defaultValue={sections.contact_whatsapp || ''} id="contact_whatsapp" />
              <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={() => updateText('contact_whatsapp', document.getElementById('contact_whatsapp').value)}>Save</button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Twitter link</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded border px-3 py-2" defaultValue={sections.social_twitter || ''} id="social_twitter" />
              <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={() => updateText('social_twitter', document.getElementById('social_twitter').value)}>Save</button>
            </div>

            <label className="text-sm font-medium">Instagram link</label>
            <div className="flex gap-2">
              <input className="flex-1 rounded border px-3 py-2" defaultValue={sections.social_instagram || ''} id="social_instagram" />
              <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={() => updateText('social_instagram', document.getElementById('social_instagram').value)}>Save</button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold mb-2">Admin — Preview as User / Doctor</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {userItems.map(b => {
            const Icon = b.icon;
            const img = sections[b.key];
            const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
            return (
              <Card key={b.key} className={CARD_STYLE}>
                <div className="relative w-full">
                  {imgSrc ? (
                    <img src={imgSrc} alt={b.label} className="w-full h-36 object-cover rounded-md -mx-6 mt-0" />
                  ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400">
                      <Icon size={48} className="text-slate-200" />
                    </div>
                  )}

                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(b.key, f); }} />
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <div className="text-xl font-extrabold">{b.label}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-base font-semibold mb-2">Promo circle images</div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {['promo-circle-1','promo-circle-2','promo-circle-3','promo-circle-4','promo-circle-5'].map((key, idx) => {
            const img = sections[key];
            const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;
            return (
              <Card key={key} className={CARD_STYLE}>
                <div className="relative w-full flex items-center justify-center">
                  {imgSrc ? (
                    <img src={imgSrc} alt={key} className="w-24 h-24 object-cover rounded-full" />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-2 border-pink-600 flex items-center justify-center text-sm text-slate-400">Empty</div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(key, f); }} />
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">Promo {idx+1}</div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-base font-semibold mb-2">Pharmacy categories</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.filter(c => c).map((c) => {
            const key = `category-${c}`;
            const img = sections[key];
            return (
              <Card key={c} className={CARD_STYLE}>
                <div className="relative w-full">
                  {img ? (
                    <img src={img} alt={c} className="w-full h-36 object-cover rounded-md -mx-6 mt-0" />
                  ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(key, f); }} />
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">{c}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-base font-semibold mb-2">Doctor specializations</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* All specialization card */}
          {(() => {
            const s = 'All';
            const key = `specialization-${s}`;
            const img = sections[key];
            return (
              <Card key={s} className={CARD_STYLE}>
                <div className="relative w-full">
                  {img ? (
                    <img src={img} alt={s} className="w-full h-36 object-cover rounded-md -mx-6 mt-0" />
                  ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(key, f); }} />
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">{s}</div>
                </div>
              </Card>
            );
          })()}

          {specializations.filter(s => s).map((s) => {
            const key = `specialization-${s}`;
            const img = sections[key];
            return (
              <Card key={s} className={CARD_STYLE}>
                <div className="relative w-full">
                  {img ? (
                    <img src={img} alt={s} className="w-full h-36 object-cover rounded-md -mx-6 mt-0" />
                  ) : (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400">Waiting for image</div>
                  )}
                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(key, f); }} />
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="text-xl font-extrabold">{s}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
