import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe from 'stripe';
import mongoose from 'mongoose';
import Address from '../models/Address.js'; // ✅ Add this import

export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { userId } = req;

    if (!address || !mongoose.Types.ObjectId.isValid(address) || items.length === 0) {
      return res.json({ success: false, message: "Address and valid details are required" });
    }

    // ✅ Get address details
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

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
      paidAmount: 0,
      dueAmount: amount,
      paymentStatus: `Due ₹${amount}`,
    });

    console.log("Creating order with amount:", amount);

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

    if (!address || items.length === 0) {
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

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
      paidAmount: 0,
      dueAmount: amount,
      paymentStatus: `Due ₹${amount}`,
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
        res.status(400).send('WebHook Error ' , error.message)
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
            $or: [{ paymentType: "COD" }, { isPaid: true }]
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
    const { id } = req.params;
    const { paymentStatus, dueAmount } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.json({ success: false, message: "Order not found" });

    const total = order.amount;
    const newDue = Number(dueAmount);

    // auto-calculated fields
    order.dueAmount = newDue;
    order.paidAmount = total - newDue;
    
    order.paymentStatus = paymentStatus;
    order.isPaid = newDue === 0;

    console.log("Updating payment for:", id, "due:", dueAmount);

    await order.save();

    res.json({ success: true, message: "Payment updated successfully" });
  } catch (e) {
    res.json({ success: false, message: "Error updating payment: " + e.message });
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




