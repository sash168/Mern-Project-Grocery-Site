export const buildBillText = (order) => {
  const now = new Date();

  let bill = `
S3 Retail Hub
------------------------------
Invoice: ${now.getTime()}
Date: ${now.toLocaleDateString("en-IN")}
Customer: ${order.customerName || "Guest"}
------------------------------
`;

  order.items.forEach((i) => {
    const name = (i.product?.name || i.name).slice(0, 20);
    const price = (i.product?.offerPrice || i.offerPrice) * i.quantity;
    bill += `${name} x${i.quantity}   ₹${price}\n`;
  });

  bill += `
------------------------------
Total: ₹${order.amount}
------------------------------
Thank you! Visit again
`;

  return bill;
};
