import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("user@medoswift.dev");
  const [password, setPassword] = useState("User@1234");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.push(`Welcome back, ${u.name}!`, "success");
      if (u.role === "admin") nav("/admin");
      else if (u.role === "doctor") nav("/doctor");
      else nav("/");
    } catch (e2) {
      toast.push(e2?.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-5xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8">
            <div className="text-sm font-semibold text-brand-800">🩺 MedoSwift</div>
            <h1 className="mt-3 text-3xl font-extrabold">Sign in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Pharmacy • Doctors • Organizer • Real-time Tracking
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-2">Password</div>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button disabled={loading} className="w-full" size="lg">
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <div className="text-sm text-slate-600">
                New here? <Link className="text-brand-800 font-semibold" to="/register">Create an account</Link>
              </div>

              <div className="mt-5 text-xs text-slate-500 space-y-1">
                <div><span className="font-semibold">Seed accounts:</span></div>
                <div>User: user@medoswift.dev / User@1234</div>
                <div>Doctor: aditi@medoswift.dev / Doctor@123</div>
                <div>Admin: admin@medoswift.dev / Admin@123</div>
              </div>
            </form>
          </div>

          <div className="relative bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white">
            <div className="text-sm opacity-90">Everything in one dashboard</div>
            <div className="mt-3 text-4xl font-extrabold leading-tight">
              Scan prescriptions,
              <br /> auto-add medicines,
              <br /> track delivery live.
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                ["🔎", "Global Search", "Quick navigation to doctors and medicines."],
                ["🧾", "OCR Prescription", "Upload image/PDF and extract medicines."],
                ["🗓️", "Appointments", "Book online slots with doctors."],
                ["📍", "Live Tracking", "Leaflet + OSM map with courier marker."],
              ].map((c, i) => (
                <div key={i} className="rounded-3xl bg-white/10 border border-white/10 p-4">
                  <div className="text-2xl">{c[0]}</div>
                  <div className="mt-1 font-semibold">{c[1]}</div>
                  <div className="mt-1 text-xs opacity-90">{c[2]}</div>
                </div>
              ))}
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_40%,white,transparent_42%),radial-gradient(circle_at_50%_90%,white,transparent_40%)]" />
          </div>
        </div>
      </Card>
    </div>
  );
}
