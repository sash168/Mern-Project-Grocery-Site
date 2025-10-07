import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true},
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true},
    quantity: { type: Number, required: true, default: 0 }, // remaining stock
    inStock: { type: Boolean, default: true},
}, {timestamps:true});

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product;