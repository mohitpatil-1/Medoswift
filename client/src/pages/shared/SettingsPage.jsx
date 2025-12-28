import React, { useEffect, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useAuth } from "../../app/auth/AuthProvider.jsx";

export default function SettingsPage() {
  const toast = useToast();
  const { refreshMe } = useAuth();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", defaultPaymentMethod: "UPI" });
  const [selectedAddressId, setSelectedAddressId] = useState(() => localStorage.getItem('ms_selected_address') || "");

  async function load() {
    const { data } = await api.get("/api/users/me");
    setMe(data.user);
    setForm({
      name: data.user?.name || "",
      phone: data.user?.phone || "",
      defaultPaymentMethod: data.user?.defaultPaymentMethod || "UPI",
    });
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!me) return;
    const sid = localStorage.getItem('ms_selected_address') || me.addresses?.[0]?._id || "";
    if (sid) setSelectedAddressId(sid);
  }, [me]);

  function selectAddress(id, addr) {
    localStorage.setItem('ms_selected_address', id);
    localStorage.setItem('ms_selected_address_label', addr?.city || addr?.label || "");
    setSelectedAddressId(id);
    // notify other parts of the app (topbar)
    window.dispatchEvent(new CustomEvent('ms:addressChanged', { detail: { id } }));
    toast.push('Selected address', 'success');
  }

  async function save() {
    try {
      await api.patch("/api/users/me", form);
      await refreshMe();
      toast.push("Saved", "success");
      await load();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  if (!me) return <div className="p-2 text-sm text-slate-600">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Settings</div>
        <div className="text-2xl font-extrabold">Account & preferences</div>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Name</div>
            <Input value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Phone</div>
            <Input value={form.phone} onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))} placeholder="Optional" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Default payment</div>
            <Select value={form.defaultPaymentMethod} onChange={(e) => setForm(s => ({ ...s, defaultPaymentMethod: e.target.value }))}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Role</div>
            <Input value={me.role} disabled />
          </div>
        </div>
        <Button className="mt-5" onClick={save}>Save</Button>
      </Card>

      {me.addresses && me.addresses.length > 0 && (
        <Card className="p-6">
          <div className="text-sm font-semibold">Saved addresses</div>
          <div className="mt-4 space-y-3">
            {me.addresses.map(a => (
              <label key={a._id} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4 cursor-pointer hover:bg-slate-50">
                <input type="radio" name="selectedAddress" checked={selectedAddressId === a._id} onChange={() => selectAddress(a._id, a)} />
                <div>
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
