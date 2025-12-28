import React, { useEffect, useRef, useState } from "react";

function polarToPos(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function ClockPicker({ value = "08:00", onChange }) {
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
    const t = e.currentTarget; try{ t.setPointerCapture(e.pointerId);}catch{}; handlePointer(e.clientX,e.clientY);
    const mv=(ev)=>handlePointer(ev.clientX,ev.clientY);
    const up=(ev)=>{ handlePointer(ev.clientX,ev.clientY); try{ t.releasePointerCapture(e.pointerId);}catch{}; window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); if(mode==='hour') setMode('minute'); else { emit(hour,minute); setOpen(false); } };
    window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
  }

  const hourDeg = (((hour%12)||0)*30)+(minute/60)*30; const minuteDeg = minute*6;
  function display(){ return `${String(to24(hour)).padStart(2,'0')}:${String(minute).padStart(2,'0')}`; }

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <input readOnly value={display()} onClick={()=>{setOpen(v=>!v); setMode('hour');}} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400" />
        <button onClick={()=>{setOpen(v=>!v); setMode('hour');}} className="px-3 py-2 rounded-2xl border border-slate-200 bg-white">🕒</button>
      </div>
      {open && (
        <div className="absolute z-50 mt-2 right-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 w-64">
            <div className="text-sm text-slate-600 mb-2">Pick {mode}</div>
            <div ref={wrapRef} onPointerDown={onPointerDown} style={{touchAction:'none'}} className="relative mx-auto h-40 w-40 rounded-full bg-white">
              {[12,1,2,3,4,5,6,7,8,9,10,11].map((num,i)=>{ const ang=i*30; const pos=polarToPos(80,80,60,ang); return <div key={num} style={{position:'absolute', left: pos.x-80-10 + 'px', top: pos.y-80-8 + 'px', width:20, textAlign:'center', fontSize:12}}>{num}</div> })}
              {[...Array(60)].map((_,i)=>{ const ang=i*6; const pos=polarToPos(80,80,72,ang); const small=i%5!==0; return <div key={i} style={{position:'absolute', left: pos.x-80 + 'px', top: pos.y-80 + 'px', width:2, height:2, borderRadius:2, background: small? '#cbd5e1':'#94a3b8'}} /> })}
              <div style={{position:'absolute', left:'50%', top:'50%', transform:`rotate(${hourDeg}deg)`, transformOrigin:'0 0'}}><div style={{width:2, height:48, background:'#0f172a', transform:'translate(-1px, -48px)'}}/></div>
              <div style={{position:'absolute', left:'50%', top:'50%', transform:`rotate(${minuteDeg}deg)`, transformOrigin:'0 0'}}><div style={{width:2, height:64, background:'#0f172a', transform:'translate(-1px, -64px)'}}/></div>
              <div style={{position:'absolute', left:'50%', top:'50%', width:10, height:10, marginLeft:-5, marginTop:-5, borderRadius:6, background:'#0f172a'}} />
              <div className="absolute inset-0 flex items-end justify-between p-2">
                <div className="flex gap-2">
                  <button className={`px-2 py-1 rounded ${mode==='hour' ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setMode('hour')}>Hour</button>
                  <button className={`px-2 py-1 rounded ${mode==='minute' ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setMode('minute')}>Minute</button>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <button className={`px-2 py-1 rounded ${!pm ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setPm(false)}>AM</button>
                    <button className={`px-2 py-1 rounded ${pm ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={()=>setPm(true)}>PM</button>
                  </div>
                  <button className="px-3 py-1 rounded-2xl border" onClick={()=>setOpen(false)}>Cancel</button>
                  <button className="px-3 py-1 rounded-2xl bg-brand-700 text-white" onClick={()=>{ emit(hour, minute); setOpen(false); }}>Set</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
              >
                🕒
              </button>
            </div>

            {open && (
              <div className="absolute z-50 mt-2 right-0">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 w-64">
                  <div className="text-sm text-slate-600 mb-2">Pick {mode}</div>
                  <div
                    ref={wrapRef}
                    onPointerDown={onPointerDown}
                    style={{ touchAction: "none" }}
                    className="relative mx-auto h-40 w-40 rounded-full bg-white"
                  >
                    {/* clock numbers */}
                    {[12,1,2,3,4,5,6,7,8,9,10,11].map((num, i) => {
                      const ang = i * 30;
                      const pos = polarToPos(80, 80, 60, ang);
                      return (
                        <div key={num} style={{ position: "absolute", left: pos.x - 80 - 10 + "px", top: pos.y - 80 - 8 + "px", width: 20, textAlign: "center", fontSize: 12 }}>
                          {num}
                        </div>
                      );
                    })}

                    {/* minute ticks optional */}
                    {[...Array(60)].map((_, i) => {
                      const ang = i * 6;
                      const pos = polarToPos(80, 80, 72, ang);
                      const small = i % 5 !== 0;
                      return (
                        <div key={i} style={{ position: "absolute", left: pos.x - 80 + "px", top: pos.y - 80 + "px", width: 2, height: 2, borderRadius: 2, background: small ? "#cbd5e1" : "#94a3b8" }} />
                      );
                    })}

                    {/* hour hand */}
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: `rotate(${hourDeg}deg)`, transformOrigin: "0 0" }}>
                      <div style={{ width: 2, height: 48, background: "#0f172a", transform: "translate(-1px, -48px)" }} />
                    </div>

                    {/* minute hand */}
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: `rotate(${minuteDeg}deg)`, transformOrigin: "0 0" }}>
                      <div style={{ width: 2, height: 64, background: "#0f172a", transform: "translate(-1px, -64px)" }} />
                    </div>

                    <div style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: 6, background: "#0f172a" }} />

                    <div className="absolute inset-0 flex items-end justify-between p-2">
                      <div className="flex gap-2">
                        <button className={`px-2 py-1 rounded ${mode==='hour' ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={() => setMode('hour')}>Hour</button>
                        <button className={`px-2 py-1 rounded ${mode==='minute' ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={() => setMode('minute')}>Minute</button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-2">
                          <button className={`px-2 py-1 rounded ${!pm ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={() => setPm(false)}>AM</button>
                          <button className={`px-2 py-1 rounded ${pm ? 'bg-brand-50 border border-brand-100 text-brand-800' : 'bg-white border border-slate-100'}`} onClick={() => setPm(true)}>PM</button>
                        </div>
                        <button className="px-3 py-1 rounded-2xl border" onClick={() => { setOpen(false); }}>Cancel</button>
                        <button className="px-3 py-1 rounded-2xl bg-brand-700 text-white" onClick={() => { emit(hour, minute); setOpen(false); }}>Set</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
