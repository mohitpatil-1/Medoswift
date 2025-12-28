import express from "express";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { DoctorProfile } from "../models/DoctorProfile.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(2).max(30).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user","doctor"]).default("user"),
});

router.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw createError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      username: username ? username.toLowerCase() : email.split("@")[0],
      email,
      passwordHash,
      role,
    });

    if (role === "doctor") {
      await DoctorProfile.create({
        user: user._id,
        approved: false,
        specialization: "General Physician",
        qualification: "",
        experienceYears: 0,
        consultationFee: 300,
        rating: 4.6,
      });
    }

    const token = signToken({ sub: user._id.toString(), role: user.role });
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, role: user.role, name: user.name, email: user.email },
    });
  } catch (e) {
    next(e);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createError(401, "Invalid email or password");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw createError(401, "Invalid email or password");

    if (user.role === "doctor") {
      const prof = await DoctorProfile.findOne({ user: user._id });
      if (prof && !prof.approved) {
        throw createError(403, "Doctor account pending admin approval");
      }
    }

    const token = signToken({ sub: user._id.toString(), role: user.role });
    res.json({
      success: true,
      token,
      user: { id: user._id, role: user.role, name: user.name, email: user.email },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
