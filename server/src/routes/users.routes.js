import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  dob: z.coerce.date().optional(),
  defaultPaymentMethod: z.enum(["UPI","Card","Cash"]).optional(),
  theme: z.enum(["light","dark"]).optional(),
});

router.patch("/me", requireAuth, validateBody(updateSchema), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true }).select("-passwordHash");
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

const addressSchema = z.object({
  label: z.string().optional().default("Home"),
  line1: z.string().min(3),
  line2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

router.post("/me/addresses", requireAuth, validateBody(addressSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (e) { next(e); }
});

router.delete("/me/addresses/:addressId", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (e) { next(e); }
});

export default router;
