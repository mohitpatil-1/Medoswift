import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useCart } from "../../app/cart/CartProvider.jsx";

export default function PrescriptionsPage() {
  const toast = useToast();
  const cart = useCart();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [latest, setLatest] = useState(null);
  const [mine, setMine] = useState([]);

  async function loadMine() {
    const { data } = await api.get("/api/prescriptions/mine");
    setMine(data.items || []);
  }

  useEffect(() => { loadMine(); }, []);

  async function scan() {
    if (!file) return toast.push("Choose an image or PDF", "error");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/api/prescriptions/scan", form, { headers: { "Content-Type": "multipart/form-data" } });
      setLatest(data);
      toast.push("Prescription scanned", "success");
      await loadMine();
    } catch (e) {
      toast.push(e?.response?.data?.message || "Scan failed", "error");
    } finally {
      setUploading(false);
    }
  }

  const matched = useMemo(() => latest?.extracted?.matched || [], [latest]);

  function addAll() {
    if (matched.length === 0) return toast.push("No matched medicines found", "error");
    for (const m of matched) {
      cart.add({ medicineId: m.id, name: m.name, price: m.price }, 1);
    }
    toast.push(`Added ${matched.length} medicines to cart`, "success");
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Prescriptions</div>
        <div className="text-2xl font-extrabold">OCR scan → Auto-add to cart</div>
      </div>

      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold">Upload prescription</div>
            <div className="text-sm text-slate-600 mt-1">Supported: PNG/JPG/PDF (≤ 8 MB)</div>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="mt-4 block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button className="mt-4" onClick={scan} disabled={uploading}>
              {uploading ? "Scanning…" : "Scan with OCR"}
            </Button>

            {latest?.extracted && (
              <div className="mt-5 space-y-3">
                <div className="text-sm font-semibold">Detected medicines</div>
                {matched.length === 0 && <div className="text-sm text-slate-600">No confident matches. You can still add manually from Pharmacy.</div>}
                <div className="flex flex-wrap gap-2">
                  {matched.map((m) => (
                    <span key={m.id} className="text-xs rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-brand-800">
                      {m.name}
                    </span>
                  ))}
                </div>

                <Button variant="soft" onClick={addAll}>Add all to cart</Button>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">Raw extracted text</summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap rounded-2xl bg-slate-50 border border-slate-200 p-4 max-h-64 overflow-auto">
                    {latest.extracted.rawText || "(empty)"}
                  </pre>
                </details>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold">How it works</div>
            <ul className="mt-2 text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>We extract text from images using OCR.</li>
              <li>Medicine names are matched against the pharmacy catalog.</li>
              <li>Matched medicines can be added to cart instantly.</li>
            </ul>

            <div className="mt-4 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-brand-50 p-5">
              <div className="text-sm font-semibold text-slate-700">Tip</div>
              <div className="mt-1 text-sm text-slate-600">
                If your prescription is handwritten, take a clear photo in good lighting for better OCR.
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-700">Your recent scans & prescriptions</div>
        {mine.length === 0 && <Card className="p-6 text-sm text-slate-600">No prescriptions yet.</Card>}
        {mine.map((p) => (
          <Card key={p._id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-extrabold">{p.source === "doctor" ? "Doctor prescription" : "OCR scan"}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
              {p.imageUrl && (
                <a className="text-sm text-brand-800 font-semibold" href={(import.meta.env.VITE_API_URL || "http://localhost:5000") + p.imageUrl} target="_blank" rel="noreferrer">
                  View file
                </a>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(p.items || []).slice(0, 12).map((it, idx) => (
                <span key={idx} className="text-xs rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-slate-700">
                  {it.name}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
