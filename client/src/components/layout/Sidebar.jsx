import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Pill, Stethoscope, CalendarClock, NotebookPen, FileText, Package, ShoppingCart, Settings, LogOut, LayoutDashboard, Users, ClipboardList, BarChart3, Eye } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../app/auth/AuthProvider.jsx";
import { useCart } from "../../app/cart/CartProvider.jsx";

function Item({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center rounded-2xl py-3 text-sm transition",
          collapsed ? "justify-center px-2" : "gap-3 px-4",
          isActive
            ? "bg-brand-50 text-brand-800 border border-brand-100 dark:bg-brand-900/20 dark:text-brand-200 dark:border-brand-900/40"
            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900/40"
        )
      }
    >
      <Icon size={18} />
      {!collapsed && <span className="font-medium">{label}</span>}
    </NavLink>
  );
}

export function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const role = user?.role;

  const userItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/pharmacy", icon: Pill, label: "Pharmacy" },
    { to: "/doctors", icon: Stethoscope, label: "Doctors" },
    { to: "/appointments", icon: CalendarClock, label: "Appointments" },
    { to: "/organizer", icon: NotebookPen, label: "Organizer" },
    { to: "/prescriptions", icon: FileText, label: "Prescriptions" },
    { to: "/orders", icon: Package, label: "Your Orders" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const doctorItems = [
    { to: "/doctor", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/doctor/profile", icon: Stethoscope, label: "Profile" },
    { to: "/doctor/slots", icon: CalendarClock, label: "Availability" },
    { to: "/doctor/appointments", icon: ClipboardList, label: "Appointments" },
    { to: "/doctor/prescriptions", icon: FileText, label: "Prescriptions" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const adminItems = [
    { to: "/admin", icon: BarChart3, label: "Analytics" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
    { to: "/admin/medicines", icon: Pill, label: "Medicines" },
    { to: "/admin/orders", icon: Package, label: "Orders" },
    { to: "/admin/subscriptions", icon: NotebookPen, label: "Subscriptions" },
    { to: "/admin/preview", icon: Eye, label: "Preview as" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const items = role === "admin" ? adminItems : role === "doctor" ? doctorItems : userItems;

  return (
    <aside className={clsx(
      collapsed ? "w-20" : "w-[260px]",
      "shrink-0 bg-slate-50 min-h-screen sticky top-0 dark:bg-slate-950 transition-all"
    )}>
      <div className={clsx(collapsed ? "p-3" : "p-5")}>
        <div className={clsx("flex items-center", collapsed ? "justify-center" : "gap-2")}>
          <div className="h-9 w-9 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-800 font-bold">🩺</div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-extrabold text-brand-800 dark:text-brand-200">MedoSwift</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Hello, {user?.name?.split(" ")[0]}</div>
            </div>
          )}
        </div>
      </div>

      <div className={clsx(collapsed ? "px-2 space-y-2" : "px-4 space-y-1")}>
        {items.map(i => <Item key={i.to} {...i} collapsed={collapsed} />)}

        {role === "user" && (
          <button
            onClick={() => navigate("/cart")}
            className={clsx(
              "w-full flex items-center rounded-2xl text-sm hover:bg-slate-50 dark:hover:bg-slate-900/40",
              collapsed ? "justify-center py-3" : "justify-between px-4 py-3 text-slate-600"
            )}
          >
            <span className={clsx("flex items-center", collapsed ? "" : "gap-3")}>
              <ShoppingCart size={18} />
              {!collapsed && <span className="font-medium">Cart</span>}
            </span>
            {!collapsed && <span className="rounded-full bg-brand-50 border border-brand-100 px-2 py-0.5 text-xs text-brand-800">{count()}</span>}
          </button>
        )}
      </div>

      <div className="mt-auto p-4">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className={clsx(
            "w-full flex items-center rounded-2xl text-sm hover:bg-slate-50",
            collapsed ? "justify-center py-3" : "gap-3 px-4 py-3 text-slate-600"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
