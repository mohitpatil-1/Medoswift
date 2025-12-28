import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  medicineName: { type: String, required: true },
  dosage: { type: String, default: "" },
  timeOfDay: { type: String, required: true }, // "08:30"
  daysOfWeek: { type: [Number], default: [1,2,3,4,5,6,0] }, // 0=Sun
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const Reminder = mongoose.model("Reminder", ReminderSchema);
