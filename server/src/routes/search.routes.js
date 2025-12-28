import express from "express";
import { z } from "zod";
import { validateQuery } from "../middleware/validate.js";
import { Medicine } from "../models/Medicine.js";
import { User } from "../models/User.js";
import { DoctorProfile } from "../models/DoctorProfile.js";

const router = express.Router();

router.get("/", validateQuery(z.object({ q: z.string().min(1).max(64) })), async (req, res, next) => {
  try {
    const q = req.query.q.trim();
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const medicines = await Medicine.find({
      $or: [{ name: rx }, { category: rx }, { description: rx }],
    }).limit(8).select("name category price rating icon");

    const doctorProfiles = await DoctorProfile.find({
      approved: true,
      $or: [{ specialization: rx }, { qualification: rx }],
    }).limit(8).populate("user", "name").select("specialization experienceYears consultationFee rating user");

    // also search doctor name
    const doctorUsers = await User.find({ role: "doctor", name: rx }).limit(8).select("_id name");
    const doctorUserIds = doctorUsers.map(d => d._id);
    const nameMatchedProfiles = doctorUserIds.length
      ? await DoctorProfile.find({ approved: true, user: { $in: doctorUserIds } })
          .populate("user", "name")
          .select("specialization experienceYears consultationFee rating user")
      : [];

    const doctors = [...doctorProfiles, ...nameMatchedProfiles]
      .slice(0, 10)
      .map(p => ({
        id: p.user?._id,
        name: p.user?.name,
        specialization: p.specialization,
        experienceYears: p.experienceYears,
        consultationFee: p.consultationFee,
        rating: p.rating,
      }));

    res.json({ success: true, medicines, doctors });
  } catch (e) {
    next(e);
  }
});

export default router;
