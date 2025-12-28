import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  plan: { type: String, enum: ["OrganizerMonthly"], default: "OrganizerMonthly" },
  status: { type: String, enum: ["active","cancelled","expired"], default: "active", index: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
