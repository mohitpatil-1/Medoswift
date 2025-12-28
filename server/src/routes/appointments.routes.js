import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Appointment } from "../models/Appointment.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { DoctorProfile } from "../models/DoctorProfile.js";

const router = express.Router();

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === "user") {
      const items = await Appointment.find({ user: req.user._id })
        .populate("doctorUser", "name")
        .populate("slot", "start end")
        .sort({ createdAt: -1 });
      return res.json({ success: true, items });
    }

    if (req.user.role === "doctor") {
      const items = await Appointment.find({ doctorUser: req.user._id })
        .populate("user", "name")
        .populate("slot", "start end")
        .sort({ createdAt: -1 });
      return res.json({ success: true, items });
    }

    const items = await Appointment.find()
      .populate("user", "name")
      .populate("doctorUser", "name")
      .populate("slot", "start end")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, items });
  } catch (e) { next(e); }
});

const bookSchema = z.object({
  doctorId: z.string().min(1),
  slotId: z.string().min(1),
  mode: z.enum(["online","inperson"]).default("online"),
});

router.post("/book", requireAuth, requireRole("user"), validateBody(bookSchema), async (req, res, next) => {
  try {
    const { doctorId, slotId, mode } = req.body;

    const prof = await DoctorProfile.findOne({ user: doctorId, approved: true });
    if (!prof) throw createError(404, "Doctor not available");

    const slot = await AvailabilitySlot.findOne({ _id: slotId, doctorUser: doctorId });
    if (!slot || slot.isBooked) throw createError(409, "Slot not available");

    slot.isBooked = true;
    await slot.save();

    const meetingLink = mode === "online"
      ? `https://meet.jit.si/medoswift-${slot._id.toString().slice(-6)}-${Date.now().toString(36)}`
      : "";

    const appt = await Appointment.create({
      user: req.user._id,
      doctorUser: doctorId,
      slot: slot._id,
      status: "confirmed",
      mode,
      meetingLink,
    });

    res.status(201).json({ success: true, appointment: appt });
  } catch (e) { next(e); }
});

router.patch("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw createError(404, "Appointment not found");

    const isOwner = appt.user.toString() === req.user._id.toString();
    const isDoctor = appt.doctorUser.toString() === req.user._id.toString();
    if (!(isOwner || isDoctor || req.user.role === "admin")) throw createError(403, "Forbidden");

    if (appt.status === "cancelled") return res.json({ success: true, appointment: appt });

    appt.status = "cancelled";
    await appt.save();

    await AvailabilitySlot.findByIdAndUpdate(appt.slot, { $set: { isBooked: false } });

    res.json({ success: true, appointment: appt });
  } catch (e) { next(e); }
});

router.patch("/:id/complete", requireAuth, requireRole("doctor"), async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) throw createError(404, "Appointment not found");
    if (appt.doctorUser.toString() !== req.user._id.toString()) throw createError(403, "Forbidden");
    appt.status = "completed";
    await appt.save();
    res.json({ success: true, appointment: appt });
  } catch (e) { next(e); }
});

export default router;
