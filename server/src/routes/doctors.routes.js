import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { DoctorProfile } from "../models/DoctorProfile.js";

const router = express.Router();

// Public list for patients (approved only)
router.get("/", async (_req, res, next) => {
  try {
    const profiles = await DoctorProfile.find({ approved: true })
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    const items = profiles.map(p => ({
      id: p.user?._id,
      name: p.user?.name,
      specialization: p.specialization,
      experienceYears: p.experienceYears,
      consultationFee: p.consultationFee,
      rating: p.rating,
      qualification: p.qualification,
      bio: p.bio,
    }));

    res.json({ success: true, items });
  } catch (e) { next(e); }
});

// Admin: list all doctors (approved + pending)
router.get("/admin/all", requireAuth, requireRole("admin"), async (_req, res, next) => {
  try {
    const profiles = await DoctorProfile.find()
      .populate("user", "name email createdAt")
      .sort({ updatedAt: -1 });
    res.json({ success: true, items: profiles });
  } catch (e) { next(e); }
});

// Doctor: get my profile
router.get("/me", requireAuth, requireRole("doctor"), async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user._id });
    if (!profile) throw createError(404, "Doctor profile not found");
    res.json({ success: true, profile });
  } catch (e) { next(e); }
});

const profileSchema = z.object({
  qualification: z.string().optional(),
  specialization: z.string().min(2).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  bio: z.string().optional(),
});

router.patch("/me", requireAuth, requireRole("doctor"), validateBody(profileSchema), async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, profile });
  } catch (e) { next(e); }
});

// Admin: approve doctor
router.patch("/:userId/approve", requireAuth, requireRole("admin"), validateBody(z.object({ approved: z.coerce.boolean() })), async (req, res, next) => {
  try {
    const { approved } = req.body;
    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.params.userId },
      { $set: { approved } },
      { new: true }
    ).populate("user", "name email");

    if (!profile) throw createError(404, "Doctor profile not found");
    res.json({ success: true, profile });
  } catch (e) { next(e); }
});

export default router;
