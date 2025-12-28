import mongoose from "mongoose";

const DoctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
  qualification: { type: String, default: "" },
  specialization: { type: String, default: "", index: true },
  experienceYears: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 300 },
  bio: { type: String, default: "" },
  rating: { type: Number, default: 4.6 },
  approved: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const DoctorProfile = mongoose.model("DoctorProfile", DoctorProfileSchema);
