import express from "express";
import path from "path";
import multer from "multer";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Prescription } from "../models/Prescription.js";
import { Medicine } from "../models/Medicine.js";
import { Appointment } from "../models/Appointment.js";
import { extractTextFromFile } from "../utils/ocr.js";
import { matchMedicinesFromText } from "../utils/extractMedicines.js";
import { env } from "../config/env.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/png","image/jpeg","image/jpg","application/pdf"].includes(file.mimetype);
    cb(ok ? null : createError(400, "Only PNG/JPG/PDF supported"), ok);
  },
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === "doctor") {
      const items = await Prescription.find({ doctorUser: req.user._id })
        .populate("user", "name")
        .populate("items.medicine", "name category price")
        .sort({ createdAt: -1 });
      return res.json({ success: true, items });
    }

    const items = await Prescription.find({ user: req.user._id })
      .populate("doctorUser", "name")
      .populate("items.medicine", "name category price")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (e) { next(e); }
});

// User: scan prescription (OCR)
router.post("/scan", requireAuth, requireRole("user"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw createError(400, "File is required");
    const filePath = path.resolve(req.file.path);
    const rawText = await extractTextFromFile(filePath);

    const known = await Medicine.find().select("name category price rating icon prescriptionRequired");
    const { matched, candidates } = matchMedicinesFromText(rawText, known);

    const items = matched.map(m => ({
      medicine: m._id,
      name: m.name,
      dosage: "",
      frequency: "",
      durationDays: 0,
      notes: "",
    }));

    const imageUrl = `/uploads/${path.basename(filePath)}`;

    const doc = await Prescription.create({
      user: req.user._id,
      rawText,
      imageUrl,
      items,
      source: "ocr",
    });

    res.status(201).json({ 
      success: true, 
      prescription: doc,
      extracted: { rawText, candidates, matched: matched.map(m => ({ id: m._id, name: m.name, price: m.price, category: m.category, prescriptionRequired: m.prescriptionRequired })) }
    });
  } catch (e) { next(e); }
});

// Doctor: issue digital prescription for an appointment
const issueSchema = z.object({
  appointmentId: z.string().min(1),
  items: z.array(z.object({
    medicineId: z.string().optional(),
    name: z.string().min(2),
    dosage: z.string().optional().default(""),
    frequency: z.string().optional().default(""),
    durationDays: z.coerce.number().int().min(0).default(0),
    notes: z.string().optional().default(""),
  })).min(1).max(50),
  rawText: z.string().optional().default(""),
});

router.post("/issue", requireAuth, requireRole("doctor"), validateBody(issueSchema), async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.body.appointmentId);
    if (!appt) throw createError(404, "Appointment not found");
    if (appt.doctorUser.toString() !== req.user._id.toString()) throw createError(403, "Forbidden");

    const medIds = req.body.items.map(i => i.medicineId).filter(Boolean);
    const meds = medIds.length ? await Medicine.find({ _id: { $in: medIds } }).select("name") : [];
    const medMap = new Map(meds.map(m => [m._id.toString(), m]));

    const items = req.body.items.map(i => ({
      medicine: i.medicineId && medMap.has(i.medicineId) ? i.medicineId : undefined,
      name: i.medicineId && medMap.has(i.medicineId) ? medMap.get(i.medicineId).name : i.name,
      dosage: i.dosage,
      frequency: i.frequency,
      durationDays: i.durationDays,
      notes: i.notes,
    }));

    const doc = await Prescription.create({
      user: appt.user,
      doctorUser: req.user._id,
      appointment: appt._id,
      items,
      rawText: req.body.rawText || "",
      source: "doctor",
    });

    res.status(201).json({ success: true, prescription: doc });
  } catch (e) { next(e); }
});

export default router;
