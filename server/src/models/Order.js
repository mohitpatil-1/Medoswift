import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
}, { _id: false });

const TimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  at: { type: Date, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [OrderItemSchema], required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 25 },
  total: { type: Number, required: true },
  shippingAddress: {
    label: String, line1: String, line2: String, city: String, state: String, pincode: String, lat: Number, lng: Number
  },
  payment: {
    method: { type: String, enum: ["UPI","Card","Cash"], default: "UPI" },
    status: { type: String, enum: ["pending","paid","failed"], default: "paid" },
    stripePaymentIntentId: { type: String, default: "" },
  },
  status: { type: String, enum: ["Placed","Confirmed","On Way","Delivered","Cancelled"], default: "Placed", index: true },
  timeline: { type: [TimelineSchema], default: [] },
  courier: {
    name: { type: String, default: "MediSwift Rider" },
    phone: { type: String, default: "" },
    location: { lat: { type: Number, default: 12.9716 }, lng: { type: Number, default: 77.5946 } },
  },
  etaMinutes: { type: Number, default: 30 },
}, { timestamps: true });

export const Order = mongoose.model("Order", OrderSchema);
