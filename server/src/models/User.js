import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  lat: { type: Number, default: 12.9716 },
  lng: { type: Number, default: 77.5946 },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ["user","doctor","admin"], default: "user", index: true },
  name: { type: String, required: true, trim: true },
  username: { type: String, trim: true, lowercase: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: "" },
  dob: { type: Date },
  addresses: { type: [AddressSchema], default: [] },
  defaultPaymentMethod: { type: String, enum: ["UPI","Card","Cash"], default: "UPI" },
  theme: { type: String, enum: ["light","dark"], default: "light" },
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);
