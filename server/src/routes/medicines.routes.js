import express from "express";
import { z } from "zod";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Medicine } from "../models/Medicine.js";

const router = express.Router();

router.get("/", validateQuery(z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})), async (req, res, next) => {
  try {
    const { q, category, page, limit } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
    }

    const [items, total] = await Promise.all([
      Medicine.find(filter).sort({ updatedAt: -1 }).skip((page-1)*limit).limit(limit),
      Medicine.countDocuments(filter),
    ]);

    const categories = await Medicine.distinct("category");
    res.json({ success: true, items, total, page, limit, categories: ["All", ...categories.sort()] });
  } catch (e) {
    next(e);
  }
});

const medSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(1),
  stock: z.coerce.number().int().min(0).default(0),
  prescriptionRequired: z.coerce.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  icon: z.string().optional().default("💊"),
});

router.post("/", requireAuth, requireRole("admin"), validateBody(medSchema), async (req, res, next) => {
  try {
    const med = await Medicine.create(req.body);
    res.status(201).json({ success: true, item: med });
  } catch (e) { next(e); }
});

router.patch("/:id", requireAuth, requireRole("admin"), validateBody(medSchema.partial()), async (req, res, next) => {
  try {
    const item = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, item });
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
