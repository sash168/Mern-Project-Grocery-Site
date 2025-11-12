import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, default: "NA" },
  day: { type: String, required: true }, // 🆕 add this field
  street: { type: String, required: true },
  city: { type: String, default: "NA" },
  state: { type: String, default: "NA" },
  zipcode: { type: Number, required: true },
  country: { type: String, default: "NA" },
  phone: { type: Number, default: "NA" },
});

const Address =
  mongoose.models.address || mongoose.model("address", addressSchema);

export default Address;
