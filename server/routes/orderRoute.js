import express from 'express';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';
import authUser from '../middlewares/authUser.js';

const ordreRouter = express.Router();

ordreRouter.post('/cod', authUser, placeOrderCOD);
ordreRouter.post('/stripe', authUser, placeOrderStripe);
ordreRouter.get('/user', authUser, getUserOrders);
ordreRouter.get('/seller', authSeller, getAllOrders);

export default ordreRouter;

