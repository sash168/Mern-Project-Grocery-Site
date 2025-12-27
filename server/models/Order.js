import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  userId: { type: String, required: true, ref: 'user' },
  items: [
    {
      product: { type: String, required: true, ref: 'product' },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: 'Address' },
  status: { type: String, default: 'Order Placed' },
  paymentType: { type: String, required: true },
  isPaid: { type: Boolean, required: true, default: false },

  paymentStatus: { type: String, default: 'Pending' },
  dueAmount: { type: Number, default: 0 },
  deliveryStatus: { type: String, default: 'Pending' },
  paidAmount: { type: Number, default: 0 },
  carriedFromPrevious: { type: Number, default: 0 },

}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);
export default Order;
