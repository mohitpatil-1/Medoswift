import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: "AvailabilitySlot", required: true, unique: true },
  status: { type: String, enum: ["pending","confirmed","cancelled","completed"], default: "confirmed", index: true },
  mode: { type: String, enum: ["online","inperson"], default: "online" },
  meetingLink: { type: String, default: "" },
  notes: { type: String, default: "" },
}, { timestamps: true });

export const Appointment = mongoose.model("Appointment", AppointmentSchema);
