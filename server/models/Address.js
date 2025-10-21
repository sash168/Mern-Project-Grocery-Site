import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: "NA"},
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "NA"},
    zipcode: { type: Number, required: true },
    country: { type: String, default: "NA"},
    phone: { type: Number, default: "NA"}
})

const Address = mongoose.models.address || mongoose.model('address', addressSchema)

export default Address;