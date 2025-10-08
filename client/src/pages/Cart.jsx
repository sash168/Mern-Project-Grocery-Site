import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    user,
    currency,
    products,
    cartItems,
    removeFromCart,
    getCardAmount,
    getCardCount,
    updateCartItem,
    navigate,
    axios,
    setCartItems,
    setProducts
  } = useAppContext();

  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  const getCart = () => {
    const tempArray = Object.keys(cartItems)
      .map((key) => {
        const product = products.find((item) => item._id === key);
        if (!product) return null;
        return { ...product, stock: product.quantity, quantity: cartItems[key] };
      })
      .filter(Boolean);
    setCartArray(tempArray);
  };

  const getUserAddress = async () => {
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (products.length > 0 && cartItems) getCart();
  }, [products, cartItems]);

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  const printBill = (order) => {
    // Mini mobile printer integration logic here
    // For now, just opening print preview
    const printWindow = window.open('', '_blank');
    let html = `<h2>Invoice</h2>
                <p>Customer: ${order.customerName || user?.name || "Guest"}</p>
                <p>Contact: ${order.customerNumber || "N/A"}</p>
                <hr>`;
    order.items.forEach(item => {
      html += `<p>${item.product?.name || "Deleted Product"} x${item.quantity} = ${currency}${(item.product?.offerPrice || 0) * item.quantity}</p>`;
    });
    html += `<hr><p>Subtotal: ${currency}${order.amount.toFixed(2)}</p>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const placeOrder = async () => {
    if (!customerName.trim()) return toast.error("Please enter a valid customer name");

    const orderAddress = selectedAddress ? selectedAddress._id : "NA";
    try {
      const { data } = await axios.post('/api/order/cod', {
        userId: user._id,
        items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
        address: selectedAddress._id,
        customerName: customerName.trim(),
        customerNumber: customerNumber.trim()
      });

      if (data.success) {
        toast.success(data.message);

        // 🖨️ Print Bill via Browser Print Dialog
        const printContent = `
          <html>
            <body style="font-family: sans-serif;">
              <h2 style="text-align:center;">Invoice</h2>
              <p><b>Customer:</b> ${customerName}</p>
              ${customerNumber ? `<p><b>Phone:</b> ${customerNumber}</p>` : ""}
              <hr/>
              ${cartArray.map(item => `
                <p>${item.name} - ${item.quantity} × ${currency}${item.offerPrice}</p>
              `).join("")}
              <hr/>
              <p><b>Total:</b> ${currency}${(getCardAmount() * 1.02).toFixed(2)}</p>
              <p><b>Payment Mode:</b> Cash on Delivery</p>
              <p style="text-align:center; margin-top:20px;">Thank you for shopping!</p>
            </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();

        // ✅ Clear cart and update state
        const updatedProducts = products.map(product => {
          const orderedItem = cartArray.find(item => item._id === product._id);
          if (orderedItem) return { ...product, quantity: product.quantity - orderedItem.quantity };
          return product;
        });
        setCartItems({});
        setProducts(updatedProducts);
        navigate('/my-orders');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!products.length || !cartItems) return null;

  return (
    <div className="mt-16 flex flex-col md:flex-row gap-8 px-4 md:px-16">
      {/* CART ITEMS */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-primary text-base">{getCardCount()} Items</span>
        </h1>

        {cartArray.map(product => (
          <div key={product._id} className="flex flex-col sm:flex-row md:grid md:grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium gap-4 md:gap-0 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-4 w-full md:flex-none cursor-pointer">
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden"
                   onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}>
                <img src={product.image[0]} alt={product.name} className="w-full h-full object-cover"/>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold"
                   onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}>
                  {product.name}
                </p>
                <p className="text-gray-500 text-sm">Size: {product.weight || "N/A"}</p>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Qty:</p>
                    <select value={cartItems[product._id]} onChange={e => updateCartItem(product._id, Number(e.target.value))} className="border px-2 py-1 rounded text-sm">
                      {Array.from({ length: product.stock }, (_, i) => <option key={i} value={i+1}>{i+1}</option>)}
                    </select>
                  </div>
                ) : <p className="text-red-500 text-sm">Out of stock</p>}
              </div>
            </div>

            <p className="text-center md:text-left text-lg font-medium">
              {currency}{(product.offerPrice * product.quantity).toFixed(2)}
            </p>

            <div className="flex justify-center md:justify-start">
              <button onClick={() => removeFromCart(product._id)} className="text-red-500 hover:text-red-700">
                <img src={assets.remove_icon} alt="Remove" className="w-6 h-6"/>
              </button>
            </div>
          </div>
        ))}

        <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-primary font-medium mt-4">
          Continue Shopping
        </button>

      </div>

      {/* ORDER SUMMARY */}
    <div className="w-full md:w-[360px] bg-gray-50 p-5 rounded-lg flex-shrink-0 self-start">
      <h2 className="text-xl font-medium mb-4">Order Summary</h2>

      <div className="mt-2 flex flex-col gap-1">
        <label className="text-sm font-medium">Customer Name *</label>
        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter customer name" className="w-full px-3 py-2 rounded border border-gray-300 text-sm" required/>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <label className="text-sm font-medium">Customer Number</label>
        <input type="text" value={customerNumber} onChange={e => setCustomerNumber(e.target.value)} placeholder="Enter customer number" className="w-full px-3 py-2 rounded border border-gray-300 text-sm"/>
      </div>

      <p className="text-sm font-medium uppercase mt-4">Delivery Address (Optional)</p>
      <div className="relative mt-2">
        <p className="text-gray-600 text-sm">
          {selectedAddress
            ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
            : "No address selected"}
        </p>
        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline text-sm">Change</button>
        {showAddress && (
          <div className="absolute z-10 top-8 w-full bg-white rounded p-2 shadow-md">
            {addresses.map((address, i) => (
              <p key={i} onClick={() => { setSelectedAddress(address); setShowAddress(false); }} className="cursor-pointer p-1 hover:bg-gray-100 text-sm rounded">
                {address.street}, {address.city}, {address.state}, {address.country}
              </p>
            ))}
            <p onClick={() => navigate("/add-address")} className="cursor-pointer text-primary text-center mt-1 p-1 hover:bg-primary/10 rounded text-sm">Add address</p>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2 text-gray-600">
        <p className="flex justify-between"><span>Price</span><span>{currency}{getCardAmount().toFixed(2)}</span></p>
        <p className="flex justify-between"><span>Shipping Fee</span><span className="text-green-600">Free</span></p>
        <p className="flex justify-between"><span>Tax (2%)</span><span>{currency}{(getCardAmount()*0.02).toFixed(2)}</span></p>
        <p className="flex justify-between text-lg font-medium mt-2"><span>Total Amount:</span><span>{currency}{(getCardAmount()*1.02).toFixed(2)}</span></p>
      </div>

      {/* NEW INVOICE BUTTON */}
      {cartArray.length > 0 && (
        <button
          onClick={() => {
            setSelectedOrder({
              customerName: customerName || user?.name || "Guest",
              customerNumber: customerNumber || "N/A",
              items: cartArray,
              amount: getCardAmount()
            });
            setShowInvoiceModal(true);
          }}
          className="w-full py-2 mt-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition font-medium"
        >
          View Invoice
        </button>
      )}

      <button onClick={placeOrder} className="w-full py-3 mt-2 bg-primary text-white rounded hover:bg-dull-primary transition font-medium">
        Place Order & Print
      </button>
    </div>


      {/* INVOICE MODAL */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md md:max-w-lg relative max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInvoiceModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 font-bold">X</button>
            <h2 className="text-xl font-medium mb-3">Invoice Preview</h2>
            <div className="bg-white p-4 rounded border border-gray-300 hover:bg-gray-50 transition rounded-md">
              <p className="text-xs">Invoice No: INV{new Date().getTime()}</p>
              <p className="text-sm">Customer: {selectedOrder.customerName || user?.name || "Guest"}</p>
              <p className="text-sm">Contact: {selectedOrder.customerNumber || "N/A"}</p>
              <hr className="my-2"/>
              {selectedOrder.items.map((item,index) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span>{item.name || item.product?.name || "Deleted Product"} (x{item.quantity})</span>
                  <span>{currency}{((item.product?.offerPrice || item.offerPrice || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr className="my-2"/>
              <p className="flex justify-between font-medium text-base">
                <span>Total Quantity:</span>
                <span>{selectedOrder.items.reduce((sum,i)=>sum+i.quantity,0)}</span>
              </p>
              <p className="flex justify-between font-bold text-lg mt-2">
                <span>Subtotal:</span>
                <span>{currency}{selectedOrder.amount.toFixed(2)}</span>
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=>printBill(selectedOrder)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Print Bill</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;
