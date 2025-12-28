import React from "react";
import clsx from "clsx";

export function Button({ className, variant="primary", size="md", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 shadow-soft",
    ghost: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
    soft: "bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />;
}
