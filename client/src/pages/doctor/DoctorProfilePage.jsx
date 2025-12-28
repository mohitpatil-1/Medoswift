import React, { useEffect, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function DoctorProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ specialization: "", qualification: "", experienceYears: 0, consultationFee: 0, bio: "" });

  async function load() {
    const { data } = await api.get("/api/doctors/me");
    setProfile(data.profile);
    setForm({
      specialization: data.profile?.specialization || "",
      qualification: data.profile?.qualification || "",
      experienceYears: data.profile?.experienceYears || 0,
      consultationFee: data.profile?.consultationFee || 0,
      bio: data.profile?.bio || "",
    });
  }

  useEffect(() => { load(); }, []);

  async function save() {
    try {
      const { data } = await api.patch("/api/doctors/me", form);
      setProfile(data.profile);
      toast.push("Profile updated", "success");
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed", "error");
    }
  }

  if (!profile) return <div className="p-2 text-sm text-slate-600">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Doctor</div>
        <div className="text-2xl font-extrabold">Profile</div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Approval status</div>
            <div className="text-lg font-extrabold mt-1">{profile.approved ? "Approved" : "Pending approval"}</div>
          </div>
          <div className="text-xs text-slate-500">Admin must approve new doctors.</div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Specialization</div>
            <Input value={form.specialization} onChange={(e) => setForm(s => ({ ...s, specialization: e.target.value }))} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Qualification</div>
            <Input value={form.qualification} onChange={(e) => setForm(s => ({ ...s, qualification: e.target.value }))} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Experience years</div>
            <Input type="number" value={form.experienceYears} onChange={(e) => setForm(s => ({ ...s, experienceYears: Number(e.target.value) }))} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Consultation fee (₹)</div>
            <Input type="number" value={form.consultationFee} onChange={(e) => setForm(s => ({ ...s, consultationFee: Number(e.target.value) }))} />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-slate-500 mb-2">Bio</div>
            <Input value={form.bio} onChange={(e) => setForm(s => ({ ...s, bio: e.target.value }))} />
          </div>
        </div>

        <Button className="mt-5" onClick={save}>Save</Button>
      </Card>
    </div>
  );
}
