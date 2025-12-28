import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import medicineRoutes from "./routes/medicines.routes.js";
import slotsRoutes from "./routes/slots.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import prescriptionRoutes from "./routes/prescriptions.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import sectionsRoutes from "./routes/sections.routes.js";
import subscriptionRoutes from "./routes/subscriptions.routes.js";
import reminderRoutes from "./routes/reminders.routes.js";
import searchRoutes from "./routes/search.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Ensure uploads directory
  const uploadsPath = path.resolve(process.cwd(), env.uploadsDir);
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

  app.set("trust proxy", 1);

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  app.use(cors({
    origin: env.clientUrl,
    credentials: true,
  }));

  app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.use(compression());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ ok: true, name: "MedoSwift API" }));

  app.use("/uploads", express.static(uploadsPath));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/medicines", medicineRoutes);
  app.use("/api/slots", slotsRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/prescriptions", prescriptionRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/sections", sectionsRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  app.use("/api/reminders", reminderRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
