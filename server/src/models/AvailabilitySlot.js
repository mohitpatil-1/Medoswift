import mongoose from "mongoose";

const AvailabilitySlotSchema = new mongoose.Schema({
  doctorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  start: { type: Date, required: true, index: true },
  end: { type: Date, required: true },
  isBooked: { type: Boolean, default: false, index: true },
}, { timestamps: true });

AvailabilitySlotSchema.index({ doctorUser: 1, start: 1 }, { unique: true });

export const AvailabilitySlot = mongoose.model("AvailabilitySlot", AvailabilitySlotSchema);
