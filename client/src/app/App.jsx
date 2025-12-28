import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute.jsx";
import { useAuth } from "./auth/AuthProvider.jsx";
import { AppShell } from "../components/layout/AppShell.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";

import UserHome from "../pages/user/UserHome.jsx";
import PharmacyPage from "../pages/user/PharmacyPage.jsx";
import DoctorsPage from "../pages/user/DoctorsPage.jsx";
import AppointmentsPage from "../pages/user/AppointmentsPage.jsx";
import OrganizerPage from "../pages/user/OrganizerPage.jsx";
import PrescriptionsPage from "../pages/user/PrescriptionsPage.jsx";
import OrdersPage from "../pages/user/OrdersPage.jsx";
import OrderDetailsPage from "../pages/user/OrderDetailsPage.jsx";
import CartPage from "../pages/user/CartPage.jsx";
import SettingsPage from "../pages/shared/SettingsPage.jsx";

import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage.jsx";
import DoctorSlotsPage from "../pages/doctor/DoctorSlotsPage.jsx";
import DoctorAppointmentsPage from "../pages/doctor/DoctorAppointmentsPage.jsx";
import DoctorPrescriptionsPage from "../pages/doctor/DoctorPrescriptionsPage.jsx";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminDoctors from "../pages/admin/AdminDoctors.jsx";
import AdminMedicines from "../pages/admin/AdminMedicines.jsx";
import AdminOrders from "../pages/admin/AdminOrders.jsx";
import AdminSubscriptions from "../pages/admin/AdminSubscriptions.jsx";
import AdminPreview from "../pages/admin/AdminPreview.jsx";

export default function App() {
  const { user } = useAuth();

  function defaultLanding() {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "doctor") return <Navigate to="/doctor" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        {/* User */}
        <Route index element={<ProtectedRoute roles={["user"]}><UserHome /></ProtectedRoute>} />
        <Route path="pharmacy" element={<ProtectedRoute roles={["user"]}><PharmacyPage /></ProtectedRoute>} />
        <Route path="doctors" element={<ProtectedRoute roles={["user"]}><DoctorsPage /></ProtectedRoute>} />
        <Route path="appointments" element={<ProtectedRoute roles={["user"]}><AppointmentsPage /></ProtectedRoute>} />
        <Route path="organizer" element={<ProtectedRoute roles={["user"]}><OrganizerPage /></ProtectedRoute>} />
        <Route path="prescriptions" element={<ProtectedRoute roles={["user"]}><PrescriptionsPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute roles={["user"]}><OrdersPage /></ProtectedRoute>} />
        <Route path="orders/:id" element={<ProtectedRoute roles={["user","admin"]}><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="cart" element={<ProtectedRoute roles={["user"]}><CartPage /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="doctor" element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="doctor/profile" element={<ProtectedRoute roles={["doctor"]}><DoctorProfilePage /></ProtectedRoute>} />
        <Route path="doctor/slots" element={<ProtectedRoute roles={["doctor"]}><DoctorSlotsPage /></ProtectedRoute>} />
        <Route path="doctor/appointments" element={<ProtectedRoute roles={["doctor"]}><DoctorAppointmentsPage /></ProtectedRoute>} />
        <Route path="doctor/prescriptions" element={<ProtectedRoute roles={["doctor"]}><DoctorPrescriptionsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="admin/doctors" element={<ProtectedRoute roles={["admin"]}><AdminDoctors /></ProtectedRoute>} />
        <Route path="admin/medicines" element={<ProtectedRoute roles={["admin"]}><AdminMedicines /></ProtectedRoute>} />
        <Route path="admin/orders" element={<ProtectedRoute roles={["admin"]}><AdminOrders /></ProtectedRoute>} />
        <Route path="admin/subscriptions" element={<ProtectedRoute roles={["admin"]}><AdminSubscriptions /></ProtectedRoute>} />
        <Route path="admin/preview" element={<ProtectedRoute roles={["admin"]}><AdminPreview /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="settings" element={<ProtectedRoute roles={["user","doctor","admin"]}><SettingsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={defaultLanding()} />
    </Routes>
  );
}
