import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  street: { type: String, required: true },
  zipcode: { type: String, required: true },
  phone: { type: String, required: true },
  day: { type: String, required: true },
  addressInfo: { type: String, default: '' } // new optional field
}, { timestamps: true });

export default mongoose.model('address', AddressSchema);
