import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    function onEsc(e){ if (e.key === "Escape") onClose?.(); }
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[55] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-[92vw] max-w-xl rounded-3xl bg-white shadow-soft border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="text-base font-semibold">{title}</div>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center text-black hover:bg-slate-100"
                title="Close"
              >
                <span style={{ lineHeight: 0 }} className="text-lg">×</span>
              </button>
              <div className="p-5" style={{ maxHeight: 'calc(80vh - 64px)', overflow: 'auto' }}>{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
