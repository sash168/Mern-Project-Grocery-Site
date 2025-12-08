// services/smsService.js
import Twilio from "twilio";
import axios from "axios";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; 

let twilioClient = null;
if (accountSid && authToken) twilioClient = Twilio(accountSid, authToken);

const buildDeliveryMessage = ({ order }) => {
  const orderId =
    order._id?.toString?.().slice(-6) || order._id?.toString() || "";
  const name = order.address?.name || "";

  let productLines = "";
  let total = 0;

  order.items.forEach((item) => {
    const product = item.product;
    const qty = item.quantity;
    const price = product?.offerPrice || product?.price || 0;
    const lineTotal = qty * price;

    total += lineTotal;

    productLines += `${product?.name} x ${qty} = ₹${lineTotal}\n`;
  });

  return (
    `Hi ${name}, your order #${orderId} has been delivered.\n\n` +
    `Items:\n${productLines}\n` +
    `Grand Total: ₹${total}\n\n` +
    `Thanks for shopping with us!`
  );
};


function formatPhoneNumber(phone) {
  if (!phone) return null;

  // Remove spaces, dashes, brackets etc.
  phone = phone.toString().replace(/[^\d]/g, "");

  // If number starts with 0, remove leading zero
  if (phone.startsWith("0")) {
    phone = phone.substring(1);
  }

  // If starts with 91 and length is 12, assume already valid
  if (phone.startsWith("91") && phone.length === 12) {
    return "+" + phone;
  }

  // If 10-digit number → assume Indian mobile
  if (phone.length === 10) {
    return "+91" + phone;
  }

  // If user enters invalid length
  return null;
}


export const sendDeliverySMS = async ({ order, phone }) => {
  // phone expected in E.164 like +91XXXXXXXXXX
  if (!phone) throw new Error("No phone number provided to send SMS");

  const formatted = formatPhoneNumber(phone);

    if (!formatted) {
    return res.status(400).json({ message: "Invalid phone number!" });
    }

  const message = buildDeliveryMessage({ order });

  // Try Twilio first (recommended)
  try {
    if (twilioClient) {
      // Do not await in caller if you don't want to block; we return promise so caller can decide
      const res = await twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: formatted,
      });
      return { success: true, provider: "twilio", sid: res.sid };
    }
  } catch (err) {
    console.error("Twilio send error:", err.message || err);
    // fall through to attempt MSG91 or return error
  }
};
