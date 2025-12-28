import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { DoctorProfile } from "../models/DoctorProfile.js";
import { Medicine } from "../models/Medicine.js";
import { Order } from "../models/Order.js";
import { Subscription } from "../models/Subscription.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, items: users });
  } catch (e) { next(e); }
});

router.patch("/users/:id", validateBody(z.object({
  role: z.enum(["user","doctor","admin"]).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  defaultPaymentMethod: z.enum(["UPI","Card","Cash"]).optional(),
})), async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).select("-passwordHash");
    if (!u) throw createError(404, "User not found");
    res.json({ success: true, user: u });
  } catch (e) { next(e); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) throw createError(404, "User not found");
    await DoctorProfile.deleteOne({ user: u._id });
    await Subscription.deleteOne({ user: u._id });
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.get("/analytics", async (_req, res, next) => {
  try {
    const [users, doctors, medicines, orders] = await Promise.all([
      User.countDocuments({ role: "user" }),
      DoctorProfile.countDocuments({}),
      Medicine.countDocuments({}),
      Order.countDocuments({}),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);
    const revenue = revenueAgg[0]?.revenue || 0;

    // simple last 7 days orders
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0,0,0,0);

    const daily = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, kpis: { users, doctors, medicines, orders, revenue }, daily });
  } catch (e) { next(e); }
});

// Organizer subscriptions
router.get("/subscriptions", async (_req, res, next) => {
  try {
    const items = await Subscription.find().populate("user", "name email").sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, items });
  } catch (e) { next(e); }
});

router.patch("/subscriptions/:id", validateBody(z.object({
  status: z.enum(["active","cancelled","expired"]).optional(),
  endAt: z.string().optional(),
})), async (req, res, next) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) throw createError(404, "Subscription not found");
    if (req.body.status) sub.status = req.body.status;
    if (typeof req.body.endAt === "string") {
      // allow empty string to mean 'no change'
      if (req.body.endAt.trim()) sub.endAt = new Date(req.body.endAt);
    }
    await sub.save();
    const full = await Subscription.findById(sub._id).populate("user", "name email");
    res.json({ success: true, subscription: full });
  } catch (e) { next(e); }
});

export default router;
