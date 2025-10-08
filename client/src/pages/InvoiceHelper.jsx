import jsPDF from "jspdf";

// Download simple invoice PDF
export const downloadInvoicePDF = (order, currency, user, orderIndex = 1, companyName = "BS Soda") => {
  const doc = new jsPDF();
  let y = 20;
  const now = new Date();
  const invoiceNo = `${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}${orderIndex}`;

  // Header
  doc.setFontSize(16);
  if (companyName) {
    doc.text(`${companyName}`, 105 , y, { align: "center" });
    y += 8;
  }

  doc.setFontSize(14);
  doc.text("Invoice", 105, y, { align: "center" });
  y += 10;

  doc.text(`Invoice No: ${invoiceNo}`, 10, y);
  y += 7;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 10, y);
  y += 7;
  doc.text(`Customer: ${order.customerName || user?.name || "Guest"}`, 10, y);
  y += 7;
  doc.text(`Contact: ${order.customerNumber || "N/A"}`, 10, y);
  y += 10;

  // Products
  order.items.forEach((item) => {
    const name = item.product?.name || item.name || "Deleted Product";
    const qty = item.quantity;
    const amount = `${((item.product?.offerPrice || item.offerPrice || 0) * qty).toFixed(2)}`;

    doc.text(name, 10, y);
    doc.text(`${qty}`, 100, y);
    const safeCurrency = currency === "₹" ? "Rs." : currency;
    doc.text(`${safeCurrency}${amount}`, 150, y);


    y += 7;
  });

  y += 7;
  doc.text(`Total Quantity: ${order.items.reduce((sum, i) => sum + i.quantity, 0)}`, 10, y);
  y += 7;
  doc.setFont(undefined, "bold");
  const safeCurrency = currency === "₹" ? "Rs." : currency;
  doc.text(`Subtotal: ${safeCurrency}${order.amount.toFixed(2)}`, 10, y);

  doc.save(`Invoice_INV${invoiceNo}.pdf`);
};


export const printInvoice = (order, currency, user, orderIndex = 1, companyName = "BS Soda") => {
  if (!order) return;

  const now = new Date();
  const invoiceNo = `${String(now.getDate()).padStart(2,'0')}${String(now.getMonth()+1).padStart(2,'0')}${orderIndex}`;

  // Prepare product items HTML
  const itemsHTML = order.items.map(item => `
    <div style="display:flex;justify-content:space-between;font-weight:500;margin:2px 0;font-size:15px">
      <span>${item.product?.name || item.name || "Deleted Product"} (x${item.quantity})</span>
      <span>${currency}${((item.product?.offerPrice || item.offerPrice || 0) * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  // HTML for invoice
  const html = `
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px 8px; font-size: 15px; line-height: 1.3; }
          h2 { text-align: center; font-size: 22px; margin-bottom: 5px; }
          .company { text-align: center; font-size: 23px; font-weight: bold; margin-bottom: 1px; }
          .header-info { margin-bottom: 1px; }
          .totals { font-weight: bold; font-size: 17px; margin-top: 3px; }
          .subtotal { font-size: 18px; font-weight: 700; margin-top: 1px; }
          .thank-you { text-align: center; margin-top: 6px; font-size: 15px; color: #16a085; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>
        ${companyName ? `<div class="company">${companyName}</div>` : ""}
        <h2>Invoice</h2>
        <div class="header-info">
          <p>Invoice No: ${invoiceNo}</p>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Customer: ${order.customerName || user?.name || "Guest"}</p>
          <p>Contact: ${order.customerNumber || "N/A"}</p>
        </div>

        ${itemsHTML}

        <p class="totals">Total Quantity: ${order.items.reduce((sum,i)=>sum+i.quantity,0)}</p>
        <p class="subtotal">Subtotal: ${currency}${order.amount.toFixed(2)}</p>
        <p class="thank-you">Thank you for shopping with us!</p>
      </body>
    </html>
  `;

  // Use iframe for printing without redirect
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  document.body.removeChild(iframe);
};
