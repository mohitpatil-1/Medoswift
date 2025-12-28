import React, { createContext, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(() => ({
    push(message, type="info") {
      const id = Math.random().toString(36).slice(2);
      const t = { id, message, type };
      setToasts((s) => [...s, t]);
      setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), 2800);
    },
  }), []);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-[60] space-y-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="max-w-sm rounded-2xl bg-white shadow-soft border border-slate-100 px-4 py-3"
            >
              <div className="text-sm">
                <span className={t.type==="success"?"text-emerald-700":t.type==="error"?"text-rose-700":"text-slate-700"}>
                  {t.message}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
