import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    address: { type: String, required: true }, // FULL address text
    phone: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Address", AddressSchema);
