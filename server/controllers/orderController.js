import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import stripe from 'stripe';

// place order as COD
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const { userId } = req;
        if (!address || items.length === 0) {
            return res.json({ success: FinalizationRegistry, message: "Invaid data" });
        }
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        //add tax charge - 2%
        amount += Math.floor(amount * 0.02);
        await Order.create({
            userId, 
            items,
            amount, 
            address, 
            paymentType: 'COD'
        })

        return res.json({success:true, message:"Order Placed Successfully"})
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while creating order record as COD "+ e.message});
    }
}

// place order as ONLINE PAYMENT
export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const { userId } = req;
        const { origin } = req.headers;
        if (!address || items.length === 0) {
            return res.json({ success: FinalizationRegistry, message: "Invaid data" });
        }

        let productData = [];
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            })
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        //add tax charge - 2%
        amount += Math.floor(amount * 0.02);
        const order = await Order.create({
            userId, 
            items,
            amount, 
            address, 
            paymentType: 'Online'
        })
        //stripe gateway initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //create lineitem for stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,  
                    },
                    unit_amount:Math.floor(item.price + item.price * 0.02)
                },
                quantity:item.quantity,
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({success:true, url:session.url})
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while creating order record as online payment "+ e.message});
    }
}

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
            await Order.findById(orderId, { isPaid: true })
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




