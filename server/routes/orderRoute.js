import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, updateDelivery, updatePayment } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';
import authUser from '../middlewares/authUser.js';
import Order from "../models/Order.js";


const ordreRouter = express.Router();

ordreRouter.post('/cod', authUser, placeOrderCOD);
ordreRouter.post('/stripe', authUser, placeOrderStripe);
ordreRouter.get('/user', authUser, getUserOrders);
ordreRouter.get('/seller', authSeller, getAllOrders);
ordreRouter.put('/updatePayment/:orderId', authSeller, updatePayment);
ordreRouter.put('/updateDelivery/:id', authSeller, updateDelivery);
ordreRouter.get('/due', authUser, getAddressDue);
// ordreRouter.get("/fix-old-orders", async (req, res) => {
//   try {
//     const orders = await Order.find({ dueAmount: 0 });

//     for (const order of orders) {
//       order.dueAmount = order.amount;
//       order.paymentStatus = `Due ₹${order.amount}`;
//       await order.save();
//     }

//     return res.json({ success: true, fixed: orders.length });

//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });



export default ordreRouter;

