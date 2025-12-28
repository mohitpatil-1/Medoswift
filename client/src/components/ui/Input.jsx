import React from "react";
import clsx from "clsx";

export function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-brand-900/30",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={clsx(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-brand-900/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
