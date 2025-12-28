import mongoose from "mongoose";

const PrescriptionItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  name: { type: String, required: true },
  dosage: { type: String, default: "" },
  frequency: { type: String, default: "" },
  durationDays: { type: Number, default: 0 },
  notes: { type: String, default: "" },
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  rawText: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  items: { type: [PrescriptionItemSchema], default: [] },
  source: { type: String, enum: ["ocr","doctor"], default: "ocr" },
}, { timestamps: true });

export const Prescription = mongoose.model("Prescription", PrescriptionSchema);
