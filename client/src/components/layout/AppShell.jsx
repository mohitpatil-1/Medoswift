import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { TopbarSearch } from "./TopbarSearch.jsx";
import Footer from "./Footer.jsx";
import StaticBanner from "./StaticBanner.jsx";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();

  return (
    <>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Sidebar collapsed={collapsed} />
        <main className="flex-1 transition-all">
          <div className="px-6 pt-6">
            <TopbarSearch collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>
          <motion.div
            className="px-6 py-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {loc.pathname === "/" && (
        <>
          <StaticBanner />
          <div className="h-10 bg-slate-50" />
        </>
      )}

      <Footer />
    </>
  );
}
