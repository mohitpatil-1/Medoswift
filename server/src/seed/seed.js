import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { DoctorProfile } from "../models/DoctorProfile.js";
import { Medicine } from "../models/Medicine.js";

async function upsertUser({ name, email, password, role, username }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      username: username || email.split("@")[0],
      role,
      passwordHash: await bcrypt.hash(password, 12),
      phone: "9999999999",
      addresses: [{
        label: "Home",
        line1: "221B, MG Road",
        line2: "",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        lat: 12.9716,
        lng: 77.5946,
      }],
      defaultPaymentMethod: "UPI",
    });
  }
  return user;
}

async function main() {
  await connectDb();

  const admin = await upsertUser({ name: "Admin", email: "admin@medoswift.dev", password: "Admin@123", role: "admin" });
  const user = await upsertUser({ name: "Demo User", email: "user@medoswift.dev", password: "User@1234", role: "user" });

  const doctorsData = [
    { name: "Dr. Aditi Sharma", email: "aditi@medoswift.dev", spec: "Cardiologist", exp: 12, fee: 500, rating: 4.9 },
    { name: "Dr. Rahul Verma", email: "rahul@medoswift.dev", spec: "General Physician", exp: 8, fee: 300, rating: 4.5 },
    { name: "Dr. Priya Singh", email: "priya@medoswift.dev", spec: "Dermatologist", exp: 5, fee: 400, rating: 4.7 },
    { name: "Dr. Amit Patel", email: "amit@medoswift.dev", spec: "Pediatrician", exp: 15, fee: 450, rating: 4.8 },
  ];

  for (const d of doctorsData) {
    const docUser = await upsertUser({ name: d.name, email: d.email, password: "Doctor@123", role: "doctor" });

    await DoctorProfile.findOneAndUpdate(
      { user: docUser._id },
      {
        $set: {
          user: docUser._id,
          approved: true,
          specialization: d.spec,
          qualification: "MBBS, MD",
          experienceYears: d.exp,
          consultationFee: d.fee,
          rating: d.rating,
          bio: "Available for online consultation and follow-ups.",
        },
      },
      { upsert: true, new: true }
    );
  }

  const meds = [
    { name: "Paracetamol 650", category: "Fever", price: 30, stock: 250, rating: 4.5, icon: "💊", prescriptionRequired: false, description: "Effective for fever and mild pain." },
    { name: "Vitamin C 500mg", category: "Supplements", price: 120, stock: 180, rating: 4.8, icon: "💊", prescriptionRequired: false, description: "Boosts immunity and skin health." },
    { name: "Cough Syrup", category: "Cold & Flu", price: 85, stock: 90, rating: 4.2, icon: "💊", prescriptionRequired: false, description: "Relief from dry and wet cough." },
    { name: "Amoxicillin 500", category: "Antibiotics", price: 150, stock: 60, rating: 4.0, icon: "💊", prescriptionRequired: true, description: "Antibiotic for bacterial infections." },
    { name: "Digestive Enzyme", category: "Digestion", price: 200, stock: 70, rating: 4.6, icon: "💊", prescriptionRequired: false, description: "Aids digestion and gut health." },
    { name: "Ibuprofen 400", category: "Pain Relief", price: 45, stock: 140, rating: 4.3, icon: "💊", prescriptionRequired: false, description: "Reduces pain and inflammation." },
    { name: "Cetirizine", category: "Allergy", price: 60, stock: 120, rating: 4.4, icon: "💊", prescriptionRequired: false, description: "Relief from allergy symptoms." },
  ];

  for (const m of meds) {
    await Medicine.findOneAndUpdate({ name: m.name }, { $set: m }, { upsert: true, new: true });
  }

  // eslint-disable-next-line no-console
  console.log("✅ Seed completed");
  // eslint-disable-next-line no-console
  console.log("Admin:", admin.email, "password:", "Admin@123");
  // eslint-disable-next-line no-console
  console.log("User:", user.email, "password:", "User@1234");
  // eslint-disable-next-line no-console
  console.log("Doctor:", "aditi@medoswift.dev", "password:", "Doctor@123");
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
