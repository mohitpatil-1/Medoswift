import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  prescriptionRequired: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5 },
  icon: { type: String, default: "💊" }, // small emoji icon used in UI cards
}, { timestamps: true });

export const Medicine = mongoose.model("Medicine", MedicineSchema);
