import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Subscription } from "../models/Subscription.js";

const router = express.Router();

router.get("/me", requireAuth, requireRole("user"), async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    res.json({ success: true, subscription: sub });
  } catch (e) { next(e); }
});

router.post("/start", requireAuth, requireRole("user"), validateBody(z.object({
  plan: z.enum(["OrganizerMonthly"]).default("OrganizerMonthly")
})), async (req, res, next) => {
  try {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);

    const sub = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      { $set: { plan: req.body.plan, status: "active", startAt: now, endAt: end } },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, subscription: sub });
  } catch (e) { next(e); }
});

router.post("/cancel", requireAuth, requireRole("user"), async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub) throw createError(404, "No subscription");
    sub.status = "cancelled";
    await sub.save();
    res.json({ success: true, subscription: sub });
  } catch (e) { next(e); }
});

export default router;
