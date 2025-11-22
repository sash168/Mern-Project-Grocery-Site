import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe from 'stripe';
import mongoose from 'mongoose';
import Address from '../models/Address.js';

export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { userId } = req;

    if (!address || !mongoose.Types.ObjectId.isValid(address) || !items || items.length === 0) {
      return res.json({ success: false, message: "Address and valid details are required" });
    }

    const addressDoc = await Address.findById(address);
    if (!addressDoc) return res.json({ success: false, message: "Invalid address" });

    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      amount += product.offerPrice * item.quantity;
      product.quantity = Math.max(product.quantity - item.quantity, 0);
      await product.save();
    }

    amount = Math.floor(amount);

    // --- NEW: sum all previous unpaid dues for this user ---
    const unpaidOrders = await Order.find({ userId, dueAmount: { $gt: 0 } });
    const prevDue = unpaidOrders.reduce((acc, o) => {
      const due = Number(o.dueAmount ?? (o.amount - (o.paidAmount || 0)));
      return acc + (isNaN(due) ? 0 : due);
    }, 0);

    const totalDue = amount;

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
      paidAmount: 0,
      dueAmount: totalDue,
      paymentStatus: `Due ₹${totalDue}`,
    });

    console.log("Creating order with amount:", amount, "carriedFromPrevious:", prevDue);

    return res.json({ success: true, message: "Order Placed Successfully" });
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
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      amount += product.offerPrice * item.quantity;
      product.quantity = Math.max(product.quantity - item.quantity, 0);
      await product.save();
    }

    amount = Math.floor(amount);

    // --- NEW: sum all previous unpaid dues for this user ---
    const unpaidOrders = await Order.find({ userId, dueAmount: { $gt: 0 } });
    const prevDue = unpaidOrders.reduce((acc, o) => {
      const due = Number(o.dueAmount ?? (o.amount - (o.paidAmount || 0)));
      return acc + (isNaN(due) ? 0 : due);
    }, 0);

    const totalDue = amount + prevDue;

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
      paidAmount: 0,
      dueAmount: totalDue,
      paymentStatus: `Due ₹${totalDue}`,
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: { orderId: order._id.toString(), userId },
    });

    return res.json({ success: true, url: session.url });
  } catch (e) {
    console.log(e.message);
    res.json({ success: false, message: "Error placing online order: " + e.message });
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
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 })
        
        return res.json({success:true, orders})
        
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while getting order record for seller "+ e.message});
    }
}

// ✅ Update payment status or due amount
export const updatePayment = async (req, res) => {
  try {
    // support both :orderId and :id just in case
    const orderId = req.params.orderId || req.params.id;
    const payAmount = Number(req.body.paidAmount);

    console.log("Updating payment for order:", orderId, "with amount:", payAmount);

    if (!payAmount || isNaN(payAmount) || payAmount <= 0) {
      return res.json({ success: false, message: "Invalid payment amount" });
    }

    // find the order requested (optional - to validate the user and show context)
    const mainOrder = orderId ? await Order.findById(orderId) : null;
    if (orderId && !mainOrder) return res.json({ success: false, message: "Order not found" });

    const userId = mainOrder ? mainOrder.userId : req.body.userId || req.userId;
    if (!userId) return res.json({ success: false, message: "User ID not found" });

    // get all unpaid orders for the user, oldest first
    const dueOrders = await Order.find({
      userId,
      $or: [{ paymentStatus: { $regex: /^Due/ } }, { dueAmount: { $gt: 0 } }]
    }).sort({ createdAt: 1 });

    let remainingPayment = payAmount;

    for (const ord of dueOrders) {
      if (remainingPayment <= 0) break;

      const currentDue = Number(ord.dueAmount ?? (ord.amount - (ord.paidAmount || 0)));
      if (isNaN(currentDue) || currentDue <= 0) continue;

      if (remainingPayment >= currentDue) {
        // fully pay this order
        ord.paidAmount = (ord.paidAmount || 0) + currentDue;
        ord.dueAmount = 0;
        ord.paymentStatus = "Fully Paid";
        remainingPayment -= currentDue;
      } else {
        // partial payment
        ord.paidAmount = (ord.paidAmount || 0) + remainingPayment;
        ord.dueAmount = currentDue - remainingPayment;
        ord.paymentStatus = `Due ₹${ord.dueAmount}`;
        remainingPayment = 0;
      }

      await ord.save();
    }

    return res.json({
      success: true,
      message: "Payment applied to outstanding orders successfully."
    });

  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Something went wrong: " + err.message });
  }
};



// ✅ Update delivery status
export const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.json({ success: false, message: "Order not found" });

    order.deliveryStatus = deliveryStatus;
    await order.save();

    res.json({ success: true, message: "Delivery status updated successfully" });
  } catch (e) {
    res.json({ success: false, message: "Error updating delivery: " + e.message });
  }
};




