import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { DoctorProfile } from "../models/DoctorProfile.js";

const router = express.Router();

// Public: list available slots for a doctor (optionally by date)
router.get("/", validateQuery(z.object({
  doctorId: z.string().min(1),
  date: z.string().optional(), // YYYY-MM-DD
})), async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    const filter = { doctorUser: doctorId, isBooked: false };
    if (date) {
      const start = new Date(date + "T00:00:00.000Z");
      const end = new Date(date + "T23:59:59.999Z");
      filter.start = { $gte: start, $lte: end };
    }
    const slots = await AvailabilitySlot.find(filter).sort({ start: 1 }).limit(200);
    res.json({ success: true, slots });
  } catch (e) { next(e); }
});

// Doctor: create slots (batch)
const createSchema = z.object({
  slots: z.array(z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })).min(1).max(200)
});

router.post("/", requireAuth, requireRole("doctor"), validateBody(createSchema), async (req, res, next) => {
  try {
    const prof = await DoctorProfile.findOne({ user: req.user._id, approved: true });
    if (!prof) throw createError(403, "Doctor not approved");

    const docs = req.body.slots.map(s => ({
      doctorUser: req.user._id,
      start: s.start,
      end: s.end,
      isBooked: false,
    }));

    const created = [];
    for (const d of docs) {
      try {
        const slot = await AvailabilitySlot.create(d);
        created.push(slot);
      } catch {
        // ignore duplicates
      }
    }
    res.status(201).json({ success: true, created });
  } catch (e) { next(e); }
});

export default router;
