import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_URL } from "../../app/api.js";

export default function BannerCarousel({ className = "" }) {
  const keys = ['banner-1','banner-2','banner-3','banner-4'];
  const [sections, setSections] = useState({});
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pollRef = useRef(null);
  const advRef = useRef(null);

  async function fetchSections() {
    try {
      const res = await api.get('/api/sections');
      setSections(res.data.items || {});
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchSections();
    // poll for changes so admin uploads reflect quickly for users
    pollRef.current = setInterval(fetchSections, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (paused) return;
    advRef.current = setInterval(() => {
      setIndex(i => (i + 1) % keys.length);
    }, 4000);
    return () => clearInterval(advRef.current);
  }, [paused]);

  const available = keys.map(k => sections[k]).filter(Boolean);
  const currentKey = keys[index % keys.length];
  const img = sections[currentKey];
  const imgSrc = img ? (img.startsWith('http') ? img : `${API_URL}${img}`) : null;

  return (
    <div className={`w-full rounded-lg overflow-hidden ${className}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div key={currentKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
          {imgSrc ? (
            <img src={imgSrc} alt={currentKey} className="w-full h-[220px] md:h-[300px] lg:h-[360px] object-cover object-center bg-white" />
          ) : (
            <div className="w-full h-[220px] md:h-[300px] lg:h-[360px] bg-slate-50 flex items-center justify-center text-slate-400">Promotional banner</div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-center gap-2">
        {keys.map((k, idx) => (
          <button key={k} onClick={() => setIndex(idx)} className={`w-8 h-1 rounded-full ${index%keys.length===idx? 'bg-rose-600': 'bg-rose-200'}`} />
        ))}
      </div>
    </div>
  );
}
