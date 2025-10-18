import jsPDF from "jspdf";

const generateBill = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Invoice / Bill", 14, 20);
    doc.setFontSize(12);
    doc.text(`Invoice No: INV${Date.now()}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 36);
    doc.text(`Customer: ${user?.name || "Guest"}`, 14, 42);

    // Table Headers
    let y = 50;
    doc.text("Product", 14, y);
    doc.text("Qty", 100, y);
    doc.text("Price", 120, y);
    doc.text("Total", 160, y);
    y += 6;

    // Table Rows
    cartArray.forEach(item => {
        doc.text(item.name, 14, y);
        doc.text(item.quantity.toString(), 100, y);
        doc.text(`${currency}${item.offerPrice}`, 120, y);
        doc.text(`${currency}${item.offerPrice * item.quantity}`, 160, y);
        y += 6;
    });

    // Summary
    y += 6;
    const subTotal = getCardAmount();
    const tax = subTotal * 0.02;
    const total = subTotal + tax;

    doc.text(`Subtotal: ${currency}${subTotal}`, 14, y);
    doc.text(`Tax (0%): ${currency}${tax.toFixed(2)}`, 14, y + 6);
    doc.text(`Total: ${currency}${total.toFixed(2)}`, 14, y + 12);

    doc.save(`Invoice_${Date.now()}.pdf`);
};

const printBill = () => {
    const printContents = document.getElementById("bill-container").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
};
