import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Subscription } from "../models/Subscription.js";
import { Reminder } from "../models/Reminder.js";
import { Medicine } from "../models/Medicine.js";

const router = express.Router();

async function requireActiveSubscription(userId) {
  const sub = await Subscription.findOne({ user: userId, status: "active", endAt: { $gte: new Date() } });
  return sub;
}

router.get("/", requireAuth, requireRole("user"), async (req, res, next) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reminders });
  } catch (e) { next(e); }
});

const schema = z.object({
  medicineId: z.string().optional(),
  medicineName: z.string().min(2),
  dosage: z.string().optional().default(""),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/),
  daysOfWeek: z.array(z.coerce.number().int().min(0).max(6)).min(1).max(7),
});

router.post("/", requireAuth, requireRole("user"), validateBody(schema), async (req, res, next) => {
  try {
    const sub = await requireActiveSubscription(req.user._id);
    if (!sub) throw createError(402, "Organizer subscription required");

    let medicine = null;
    if (req.body.medicineId) medicine = await Medicine.findById(req.body.medicineId);
    const medName = medicine ? medicine.name : req.body.medicineName;

    const reminder = await Reminder.create({
      user: req.user._id,
      medicine: medicine?._id,
      medicineName: medName,
      dosage: req.body.dosage,
      timeOfDay: req.body.timeOfDay,
      daysOfWeek: req.body.daysOfWeek,
      active: true,
    });
    res.status(201).json({ success: true, reminder });
  } catch (e) { next(e); }
});

router.patch("/:id/toggle", requireAuth, requireRole("user"), validateBody(z.object({ active: z.coerce.boolean() })), async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) throw createError(404, "Reminder not found");
    reminder.active = req.body.active;
    await reminder.save();
    res.json({ success: true, reminder });
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, requireRole("user"), async (req, res, next) => {
  try {
    const r = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!r) throw createError(404, "Reminder not found");
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
