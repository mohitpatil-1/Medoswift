import React from "react";
import clsx from "clsx";

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white border border-slate-100 shadow-soft dark:bg-slate-900 dark:border-slate-800",
        className
      )}
      {...props}
    />
  );
}
