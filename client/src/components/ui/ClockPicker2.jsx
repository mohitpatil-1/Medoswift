import React, { useEffect, useRef, useState } from "react";

function polarToPos(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function ClockPicker2({ value = "08:00", onChange }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hour");
  const [hour, setHour] = useState(() => {
    const h = Number(value.split(":")[0] || 8);
    if (Number.isNaN(h)) return 8;
    return h === 0 ? 12 : (h > 12 ? h - 12 : h);
  });
  const [minute, setMinute] = useState(() => Number(value.split(":")[1] || 0));
  const [pm, setPm] = useState(() => {
    const h = Number(value.split(":")[0] || 8);
    if (Number.isNaN(h)) return false;
    return h >= 12;
  });

  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 160, h: 160 });

  useEffect(() => {
    const [h, m] = (value || "08:00").split(":").map(Number);
    if (!Number.isNaN(h)) {
      setPm(h >= 12);
      const hh = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      setHour(hh);
    }
    if (!Number.isNaN(m)) setMinute(m);
  }, [value]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function updateSize() {
      const r = wrapRef.current;
      if (!r) return;
      const rect = r.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [open]);

  function to24(h12) { let h = h12 % 12; if (pm) h += 12; return h; }
  function emit(h12, m) { const h = to24(h12); onChange && onChange(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`); }

  function handlePointer(clientX, clientY) {
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx, dy = clientY - cy;
    let deg = Math.atan2(dy, dx) * 180 / Math.PI; deg = (deg + 90 + 360) % 360;
    if (mode === 'hour') { const idx = Math.round(deg/30)%12; setHour(idx===0?12:idx); }
    else { setMinute(Math.round(deg/6)%60); }
  }

  function onPointerDown(e) {
    e.preventDefault();
    const t = e.currentTarget;
    try { t.setPointerCapture(e.pointerId); } catch {}
    handlePointer(e.clientX, e.clientY);
    const mv = (ev) => { ev.preventDefault(); handlePointer(ev.clientX, ev.clientY); };
    const up = (ev) => {
      ev.preventDefault(); handlePointer(ev.clientX, ev.clientY);
      try { t.releasePointerCapture(e.pointerId); } catch {}
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      if (mode === 'hour') setMode('minute'); else { emit(hour, minute); setOpen(false); }
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  }

  const hourDeg = (((hour%12)||0)*30)+(minute/60)*30;
  const minuteDeg = minute*6;
  function display(){ return `${String(to24(hour)).padStart(2,'0')}:${String(minute).padStart(2,'0')}`; }

  // derived center and radii based on actual size
  const cx = size.w / 2 || 80;
  const cy = size.h / 2 || 80;
  const numRadius = Math.min(size.w, size.h) / 2 - 28;
  const tickRadius = Math.min(size.w, size.h) / 2 - 12;

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <input readOnly value={display()} onClick={()=>{setOpen(v=>!v); setMode('hour');}} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400" />
        <button onClick={()=>{setOpen(v=>!v); setMode('hour');}} className="px-3 py-2 rounded-2xl border border-slate-200 bg-white">🕒</button>
      </div>
      {open && (
        <div className="absolute z-50 mt-2 right-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 w-80">
            <div className="text-sm text-slate-600 mb-3 text-center">Pick {mode}</div>
            <div className="flex flex-col items-center gap-4">
              <div ref={wrapRef} onPointerDown={onPointerDown} style={{touchAction:'none', userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none'}} className="relative h-40 w-40 rounded-full bg-white flex items-center justify-center">
                {[12,1,2,3,4,5,6,7,8,9,10,11].map((num,i)=>{
                  const ang = i * 30;
                  const rad = (ang - 90) * (Math.PI / 180);
                  const ox = Math.cos(rad) * numRadius;
                  const oy = Math.sin(rad) * numRadius;
                  return (
                    <div key={num} style={{position:'absolute', left: `calc(50% + ${ox}px)`, top: `calc(50% + ${oy}px)`, transform:'translate(-50%,-50%)', width:24, textAlign:'center', fontSize:12, pointerEvents:'none'}}>
                        {num}
                    </div>
                  );
                })}
                {[...Array(60)].map((_,i)=>{
                  const ang = i * 6; const rad = (ang - 90) * (Math.PI / 180); const ox = Math.cos(rad) * tickRadius; const oy = Math.sin(rad) * tickRadius; const small = i % 5 !== 0;
                  return (
                    <div key={i} style={{position:'absolute', left: `calc(50% + ${ox}px)`, top: `calc(50% + ${oy}px)`, transform:'translate(-50%,-50%)', width:4, height:4, borderRadius:4, background: small? '#cbd5e1':'#94a3b8', pointerEvents:'none'}} />
                  );
                })}
                <div style={{position:'absolute', left:'50%', top:'50%', transform:`rotate(${hourDeg}deg)`, transformOrigin:'0 0'}}><div style={{width:2, height:48, background:'#0f172a', transform:'translate(-1px, -48px)'}}/></div>
                <div style={{position:'absolute', left:'50%', top:'50%', transform:`rotate(${minuteDeg}deg)`, transformOrigin:'0 0'}}><div style={{width:2, height:64, background:'#0f172a', transform:'translate(-1px, -64px)'}}/></div>
                <div style={{position:'absolute', left:'50%', top:'50%', width:10, height:10, marginLeft:-5, marginTop:-5, borderRadius:6, background:'#0f172a'}} />
              </div>

              <div className="flex items-center gap-2">
                <button className={`px-3 py-1 rounded ${mode==='hour' ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setMode('hour')}>Hour</button>
                <button className={`px-3 py-1 rounded ${mode==='minute' ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setMode('minute')}>Minute</button>
                <button className={`px-3 py-1 rounded ${!pm ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setPm(false)}>AM</button>
                <button className={`px-3 py-1 rounded ${pm ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setPm(true)}>PM</button>
              </div>

              <div className="flex items-center gap-2 justify-end w-full">
                <button className="px-3 py-1 rounded-2xl border" onClick={()=>setOpen(false)}>Cancel</button>
                <button className="px-3 py-1 rounded-2xl bg-brand-700 text-white" onClick={()=>{ emit(hour, minute); setOpen(false); }}>Set</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
