import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { useToast } from "../../components/ui/Toast.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (name.trim().length < 2) return "Enter your name";
    if (!email.includes("@")) return "Enter a valid email";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { toast.push(err, "error"); return; }

    setLoading(true);
    try {
      const u = await register({ name, username, email, password, role });
      toast.push("Account created!", "success");
      if (u.role === "doctor") {
        toast.push("Doctor account pending admin approval.", "info");
        nav("/login");
      } else {
        nav("/");
      }
    } catch (e2) {
      toast.push(e2?.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-xl p-8">
        <div className="text-sm font-semibold text-brand-800">🩺 MedoSwift</div>
        <h1 className="mt-3 text-3xl font-extrabold">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Patients can order medicines. Doctors can manage appointments.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Full name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Username (optional)</div>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="unique handle" />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">I am a</div>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Patient / User</option>
              <option value="doctor">Doctor</option>
            </Select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Password</div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
          </div>

          <Button disabled={loading} className="w-full" size="lg">
            {loading ? "Creating…" : "Create account"}
          </Button>

          <div className="text-sm text-slate-600">
            Already have an account? <Link className="text-brand-800 font-semibold" to="/login">Sign in</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
