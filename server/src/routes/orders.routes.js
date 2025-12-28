import express from "express";
import createError from "http-errors";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { Order } from "../models/Order.js";
import { Medicine } from "../models/Medicine.js";
import { User } from "../models/User.js";

const router = express.Router();

function pushTimeline(order, status) {
  order.timeline.push({ status, at: new Date() });
  order.status = status;
}

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const items = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(200);
      return res.json({ success: true, items });
    }

    if (req.user.role === "doctor") {
      return res.json({ success: true, items: [] });
    }

    const items = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (e) { next(e); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.medicine", "name category price");
    if (!order) throw createError(404, "Order not found");
    const isOwner = order.user.toString() === req.user._id.toString();
    if (!(isOwner || req.user.role === "admin")) throw createError(403, "Forbidden");
    res.json({ success: true, order });
  } catch (e) { next(e); }
});

router.get("/:id/track", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw createError(404, "Order not found");
    const isOwner = order.user.toString() === req.user._id.toString();
    if (!(isOwner || req.user.role === "admin")) throw createError(403, "Forbidden");
    res.json({ success: true, status: order.status, timeline: order.timeline, courier: order.courier, etaMinutes: order.etaMinutes, shippingAddress: order.shippingAddress });
  } catch (e) { next(e); }
});

const createSchema = z.object({
  items: z.array(z.object({
    medicineId: z.string().min(1),
    qty: z.coerce.number().int().min(1).max(20),
  })).min(1).max(50),
  addressId: z.string().optional(),
  paymentMethod: z.enum(["UPI","Card","Cash"]).optional(),
  mockPaid: z.coerce.boolean().optional().default(true),
});

router.post("/", requireAuth, requireRole("user"), validateBody(createSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = req.body.addressId
      ? user.addresses.id(req.body.addressId)
      : user.addresses[0];

    if (!address) throw createError(400, "Add an address before checkout");

    const medIds = req.body.items.map(i => i.medicineId);
    const meds = await Medicine.find({ _id: { $in: medIds } });

    const medMap = new Map(meds.map(m => [m._id.toString(), m]));

    const orderItems = [];
    let subtotal = 0;

    for (const it of req.body.items) {
      const med = medMap.get(it.medicineId);
      if (!med) throw createError(400, "Invalid medicine in cart");
      if (med.stock < it.qty) throw createError(409, `Insufficient stock for ${med.name}`);

      orderItems.push({
        medicine: med._id,
        name: med.name,
        price: med.price,
        qty: it.qty,
      });
      subtotal += med.price * it.qty;
    }

    // decrement stock
    for (const it of req.body.items) {
      await Medicine.updateOne({ _id: it.medicineId, stock: { $gte: it.qty } }, { $inc: { stock: -it.qty } });
    }

    const deliveryFee = subtotal >= 499 ? 0 : 25;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      shippingAddress: address.toObject(),
      payment: {
        method: req.body.paymentMethod || user.defaultPaymentMethod,
        status: req.body.mockPaid ? "paid" : "pending",
      },
      status: "Placed",
      timeline: [{ status: "Placed", at: new Date() }],
      courier: {
        name: "MedoSwift Rider",
        phone: "",
        location: { lat: (address.lat ?? 12.9716) + 0.01, lng: (address.lng ?? 77.5946) - 0.01 },
      },
      etaMinutes: Math.max(12, Math.min(45, Math.round(12 + subtotal / 80))),
    });

    req.app.get("io")?.to(`user:${user._id.toString()}`).emit("order:new", { orderId: order._id.toString() });

    res.status(201).json({ success: true, order });
  } catch (e) { next(e); }
});

const statusSchema = z.object({
  status: z.enum(["Placed","Confirmed","On Way","Delivered","Cancelled"]),
});

router.patch("/:id/status", requireAuth, requireRole("admin"), validateBody(statusSchema), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw createError(404, "Order not found");

    pushTimeline(order, req.body.status);
    await order.save();

    const io = req.app.get("io");
    io?.to(`order:${order._id.toString()}`).emit("order:update", { orderId: order._id.toString(), status: order.status, timeline: order.timeline });
    io?.to(`user:${order.user.toString()}`).emit("order:update", { orderId: order._id.toString(), status: order.status });

    res.json({ success: true, order });
  } catch (e) { next(e); }
});

const locSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  etaMinutes: z.coerce.number().int().min(1).max(240).optional(),
});

router.patch("/:id/courier", requireAuth, requireRole("admin"), validateBody(locSchema), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw createError(404, "Order not found");

    order.courier.location = { lat: req.body.lat, lng: req.body.lng };
    if (typeof req.body.etaMinutes === "number") order.etaMinutes = req.body.etaMinutes;
    await order.save();

    const io = req.app.get("io");
    io?.to(`order:${order._id.toString()}`).emit("order:track", { orderId: order._id.toString(), courier: order.courier, etaMinutes: order.etaMinutes });

    res.json({ success: true, order });
  } catch (e) { next(e); }
});

export default router;
