import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext"; // Assuming you have axios here

// Helper to send print job to backend
export const sendPrintJobToBackend = async (order, axios) => {
  try {
    const res = await axios.post("/api/print/create", {
      printerId: null, // optional, if you have multiple printers
      text: JSON.stringify(order) // backend expects "text"
    });
    if (res.data.success || res.data.message) {
      toast.success(res.data.message || "Print job sent!");
    } else {
      toast.error("Failed to send print job");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error sending print job");
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (order, currency, user, orderIndex = 1, companyName = "BS Soda") => {
  const doc = new jsPDF();
  let y = 20;
 const orderDate = new Date(order.createdAt);
  const invoiceNo = `${String(orderDate.getDate()).padStart(2,'0')}${String(orderDate.getMonth()+1).padStart(2,'0')}${orderIndex}`;

  const safeCurrency = currency === "₹" ? "Rs." : currency;

  // Header
  doc.setFontSize(18);
  if (companyName) {
    doc.setFont(undefined, "bold");
    doc.text(`${companyName}`, 105, y, { align: "center" });
    y += 10;
  }

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Invoice", 105, y, { align: "center" });
  y += 12;

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(`Invoice No: ${invoiceNo}`, 10, y); y += 7;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 10, y); y += 7;

  // Table header
  doc.setFont(undefined, "bold");
  doc.text("Item", 10, y);
  doc.text("Qty", 100, y);
  doc.text("Amount", 150, y);
  y += 5;
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 7;

  // Products
  doc.setFont(undefined, "normal");
  order.items.forEach((item) => {
    const name = item.product?.name || item.name || "Deleted Product";
    const qty = item.quantity;
    const amount = ((item.product?.offerPrice || item.offerPrice || 0) * qty).toFixed(2);

    doc.text(name, 10, y);
    doc.text(`${qty}`, 100, y);
    doc.text(`${safeCurrency}${amount}`, 150, y);
    y += 7;
  });

  y += 5;
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 7;

  // Totals
  doc.setFont(undefined, "bold");
  doc.text(`Total Quantity: ${order.items.reduce((sum, i) => sum + i.quantity, 0)}`, 10, y); y += 7;
  doc.text(`Subtotal: ${safeCurrency}${order.amount.toFixed(2)}`, 10, y);

  doc.save(`Invoice_INV${invoiceNo}.pdf`);
};

// Print invoice in browser
export const printInvoice = async (order, currency, user, axios, orderIndex = 1, companyName = "BS Soda") => {
  if (!order) return;

  const now = new Date();
  const invoiceNo = `${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}${orderIndex}`;
  const safeCurrency = currency === "₹" ? "Rs." : currency;

  const itemsHTML = order.items.map(item => `
    <div style="display:flex;justify-content:space-between;font-weight:500;margin:4px 0;padding:4px 2px;border-bottom:1px solid #e2e8f0;font-size:15px">
      <span>${item.product?.name || item.name || "Deleted Product"} (x${item.quantity})</span>
      <span>${safeCurrency}${((item.product?.offerPrice || item.offerPrice || 0) * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const html = `
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; font-size: 15px; color: #1f2937; }
          h2 { text-align: center; font-size: 22px; margin-bottom: 8px; font-weight: bold; }
          .company { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 4px; color: #111827; }
          .header-info { margin-bottom: 12px; }
          .header-info p { margin: 2px 0; }
          .totals { font-weight: bold; font-size: 17px; margin-top: 10px; display:flex; justify-content:space-between; border-top:5px solid #e2e8f0;font-size:15px, margin-bottom: 10px;}
          .subtotal { font-size: 18px; font-weight: 700; margin-top: 4px; display:flex; justify-content:space-between; }
          .thank-you { text-align: center; margin-top: 12px; font-size: 15px; color: #16a085; font-weight:500; }
        </style>
      </head>
      <body>
        ${companyName ? `<div class="company">${companyName}</div>` : ""}
        <h2>Invoice</h2>
        <div class="header-info">
          <p>Invoice No: INV${invoiceNo}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Customer: ${order.customerName || user?.name || "Guest"}</p>
          <p>Contact: ${order.customerNumber || "N/A"}</p>
        </div>
        <div style="border-top:5px solid #e2e8f0;font-size:15px">
          ${itemsHTML}
        </div>
        <div class="totals">
          <span>Total Quantity:</span>
          <span>${order.items.reduce((sum,i)=>sum+i.quantity,0)}</span>
        </div>
        <div class="subtotal">
          <span>Subtotal:</span>
          <span>${safeCurrency}${order.amount.toFixed(2)}</span>
        </div>
        <p class="thank-you">Thank you for shopping with us!</p>
      </body>
    </html>
  `;

  // const iframe = document.createElement('iframe');
  // iframe.style.display = 'none';
  // document.body.appendChild(iframe);
  // const doc = iframe.contentWindow.document;
  // doc.open();
  // doc.write(html);
  // doc.close();
  // iframe.contentWindow.focus();
  // iframe.contentWindow.print();
  // document.body.removeChild(iframe);

  // Send print job to backend after browser print
  if (axios) await sendPrintJobToBackend(order, axios);
};
