import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe from 'stripe';
import mongoose from 'mongoose';
import Address from '../models/Address.js';
import { sendDeliverySMS } from './smsController.js';

const applyPaymentFIFO = async ({ userId, addressId, payAmount }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let remainingPayment = payAmount;

    const dueOrders = await Order.find({
      userId,
      address: addressId,
      dueAmount: { $gt: 0 }
    }).sort({ createdAt: 1 }).session(session);

    for (const ord of dueOrders) {
      if (remainingPayment <= 0) break;

      const currentDue = Number(ord.dueAmount);
      if (remainingPayment >= currentDue) {
        ord.paidAmount += currentDue;
        ord.dueAmount = 0;
        ord.paymentStatus = "Fully Paid";
        remainingPayment -= currentDue;
      } else {
        ord.paidAmount += remainingPayment;
        ord.dueAmount = currentDue - remainingPayment;
        ord.paymentStatus = `Due ₹${ord.dueAmount}`;
        remainingPayment = 0;
      }
      await ord.save({ session });
    }

    const allOrders = await Order.find({
      userId,
      address: addressId
    }).sort({ createdAt: 1 }).session(session);

    let runningDue = 0;
    for (const ord of allOrders) {
      ord.carriedFromPrevious = runningDue;
      runningDue += ord.dueAmount;
      await ord.save({ session });
    }

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
};

export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { userId } = req;

    if (!address || !mongoose.Types.ObjectId.isValid(address) || !items || items.length === 0) {
      return res.json({ success: false, message: "Address and valid details are required" });
    }

    const addressDoc = await Address.findById(address);
    if (!addressDoc) return res.json({ success: false, message: "Invalid address" });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let amount = 0;

      for (const item of items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new Error("Product not found");

        const updated = await Product.updateOne(
          { _id: item.product, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { session }
        );

        if (updated.matchedCount === 0) {
          throw new Error("Insufficient stock");
        }

        amount += product.offerPrice * item.quantity;
      }

      const order = await Order.create([{
        userId,
        items,
        amount,
        address,
        paymentType: 'COD',
        paidAmount: 0,
        dueAmount: amount,
        paymentStatus: `Due ₹${amount}`
      }], { session });

      if (paidNow > 0) {
        await applyPaymentFIFO({
          userId,
          addressId: address,
          payAmount: paidNow
        });
      }

      await session.commitTransaction();
      return res.json({ success: true, message: "Order Placed Successfully" });

    } catch (e) {
      await session.abortTransaction();
      return res.json({ success: false, message: e.message });
    } finally {
      session.endSession();
    }
    } catch (e) {
    console.log(e.message);
    res.json({ success: false, message: "Error placing COD order: " + e.message });
  }
};

export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { userId } = req;
    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    const addressDoc = await Address.findById(address);
    if (!addressDoc) return res.json({ success: false, message: "Invalid address" });

    let productData = [];
    let amount = 0;

    // 🔹 MongoDB transaction session
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    let order;

    try {
      for (const item of items) {
        const product = await Product.findById(item.product).session(dbSession);
        if (!product) throw new Error("Product not found");

        const updated = await Product.updateOne(
          { _id: item.product, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { dbSession }
        );

        if (updated.matchedCount === 0) {
          throw new Error("Insufficient stock");
        }

        productData.push({
          name: product.name,
          price: product.offerPrice,
          quantity: item.quantity
        });

        amount += product.offerPrice * item.quantity;
      }

      order = await Order.create([{
        userId,
        items,
        amount,
        address,
        paymentType: 'Online',
        paidAmount: 0,
        dueAmount: amount,
        paymentStatus: `Due ₹${amount}`
      }], { session: dbSession });

      await dbSession.commitTransaction();
    } catch (e) {
      await dbSession.abortTransaction();
      throw e;
    } finally {
      dbSession.endSession();
    }

    // 🔹 Stripe session (different variable!)
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: { orderId: order[0]._id.toString(), userId },
    });

    return res.json({ success: true, url: stripeSession.url });

  } catch (e) {
    console.error(e.message);
    return res.json({ success: false, message: e.message });
  }
};


//stripe webhook to verify payment
export const stripeWebhooks = async (req, res) => {
     //stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        res.status(400).send('WebHook Error ' + error.message);
    }

    //handle event
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //getting session metadata

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            })

            const { orderId, userId } = session.data[0].metadata;

            const order = await Order.findById(orderId);

            await applyPaymentFIFO({
              userId,
              addressId: order.address,
              payAmount: order.amount
            });


            //mark payment as paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true })
            await User.findByIdAndUpdate(userId, {
                cartItems:{}
            })
            break;
        }
        case "payment_intent.payment_failed": { 
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //getting session metadata

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId
            })

            const { orderId } = session.data[0].metadata;

            await Order.findByIdAndDelete(orderId);
            break;
        }
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    res.json({ received: true });
}


//get orders by userId

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req;
        const orders = await Order.find({
            userId,
        }).populate("items.product address").sort({ createdAt: -1 })
        
        return res.json({success:true, orders})
        
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while getting order record for user id "+ e.message});
    }
}

//get all orders for seller

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
        }).populate("items.product address")
          .sort({ createdAt: -1 })
        
        return res.json({success:true, orders})
        
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while getting order record for seller "+ e.message});
    }
}

export const updatePayment = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.params.id;
    const payAmount = Number(req.body.paidAmount);

    if (!payAmount || isNaN(payAmount) || payAmount <= 0) {
      return res.json({ success: false, message: "Invalid payment amount" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    await applyPaymentFIFO({
      userId: order.userId,
      addressId: order.address,
      payAmount
    });

    return res.json({
      success: true,
      message: "Payment applied successfully"
    });

  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: err.message
    });
  }
};




// ✅ Update delivery status
export const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const order = await Order.findById(id).populate("address").populate("items.product");
    if (!order) return res.json({ success: false, message: "Order not found" });

    const prevStatus = order.deliveryStatus;
    order.deliveryStatus = deliveryStatus;
    await order.save();

    // If changed to Delivered and previously wasn't Delivered, trigger SMS
    if (deliveryStatus === "Delivered" && prevStatus !== "Delivered") {
      // Build phone in E.164 format: assume Indian numbers stored as 10-digit
      const rawPhone = order.address?.phone || order.phone || order.userPhone;
      console.log("Preparing to send delivery SMS to phone:", rawPhone , "for order:", order.address?.phone, "order", order);
      const phone = rawPhone
        ? rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone.replace(/\D/g,'')}`
        : null;

      // fire-and-forget (do not block response). Use a worker in production.
      (async () => {
        try {
          const result = await sendDeliverySMS({ order, phone });
          console.log("Delivery SMS send result:", result);
        } catch (err) {
          console.error("Failed to send delivery SMS:", err);
        }
      })();
    }

    return res.json({ success: true, message: "Delivery updated", order });
  } catch (e) {
    console.error("updateDelivery error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/orderController.js
export const getAddressDue = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.query;

    if (!addressId) {
      return res.json({ success: false, message: "Address required" });
    }

    const orders = await Order.find({
      userId,
      address: addressId,
      dueAmount: { $gt: 0 }
    });

    const totalDue = orders.reduce((sum, o) => sum + Number(o.dueAmount || 0), 0);

    return res.json({ success: true, due: totalDue });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};




