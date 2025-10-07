import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

const Cart = () => {
  const { user, currency, products, cartItems, removeFromCart, getCardAmount, getCardCount, updateCartItem, navigate, axios, setCartItems, setProducts } = useAppContext();
  const [showAddress, setShowAddress] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const getCart = () => {
    const tempArray = Object.keys(cartItems).map((key) => {
      const product = products.find((item) => item._id == key);
      if (!product) return null;
      return { ...product, stock: product.quantity, quantity: cartItems[key] };
    }).filter(Boolean);
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

  useEffect(() => { if (products.length > 0 && cartItems) getCart(); }, [products, cartItems]);
  useEffect(() => { if (user) getUserAddress(); }, [user]);

  const placeOrder = async () => {
    try {
      const outOfStock = cartArray.some(item => {
        const latestProduct = products.find(p => p._id === item._id);
        return !latestProduct || latestProduct.quantity <= 0 || item.quantity > latestProduct.quantity;
      });
      if (outOfStock) return toast.error("Some items in your cart are out of stock or exceed available quantity.");
      if (!selectedAddress) return toast.error("Please select an address");

      if (paymentOption === "COD") {
        const { data } = await axios.post('api/order/cod', {
          userId: user._id,
          items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
          address: selectedAddress._id
        });
        if (data.success) {
          toast.success(data.message);
          const updatedProducts = products.map(product => {
            const orderedItem = cartArray.find(item => item._id === product._id);
            if (orderedItem) return { ...product, quantity: product.quantity - orderedItem.quantity };
            return product;
          });
          setCartItems({});
          setProducts(updatedProducts);
          navigate('/my-orders');
        } else toast.error(data.message);
      } else {
        const { data } = await axios.post('api/order/stripe', {
          userId: user._id,
          items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
          address: selectedAddress._id
        });
        if (data.success) {
          setCartItems({});
          window.location.replace(data.url);
        } else toast.error(data.message);
      }
    } catch (error) { toast.error(error.message); }
  };

  if (!products.length || !cartItems) return null;

  return (
    <div className="mt-16 flex flex-col md:flex-row gap-8 px-4 md:px-16">

      {/* ------------------ CART ITEMS ------------------ */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-primary text-base">{getCardCount()} Items</span>
        </h1>

        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map(product => (
          <div
            key={product._id}
            className="flex flex-col sm:flex-row md:grid md:grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium gap-4 md:gap-0 p-4 bg-white rounded-lg shadow-sm"
          >
            {/* Product Info */}
            <div className="flex items-center gap-4 w-full md:flex-none cursor-pointer">
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden" onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}>
                <img src={product.image[0]} alt={product.name} className="w-full h-full object-cover"/>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold" onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}>{product.name}</p>
                <p className="text-gray-500 text-sm">Size: {product.weight || "N/A"}</p>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Qty:</p>
                    <select
                      value={cartItems[product._id]}
                      onChange={e => updateCartItem(product._id, Number(e.target.value))}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      {Array.from({ length: product.stock }, (_, i) => <option key={i} value={i+1}>{i+1}</option>)}
                    </select>
                  </div>
                ) : <p className="text-red-500 text-sm">Out of stock</p>}
              </div>
            </div>

            {/* Subtotal */}
            <p className="text-center md:text-left text-lg font-medium">
              {currency}{(product.offerPrice * product.quantity).toFixed(2)}
            </p>

            {/* Remove */}
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

      {/* ------------------ ORDER SUMMARY ------------------ */}
      <div className="w-full md:w-[360px] bg-gray-50 p-5 rounded-lg flex-shrink-0">
        <h2 className="text-xl font-medium mb-4">Order Summary</h2>

        {/* Address */}
        <p className="text-sm font-medium uppercase">Delivery Address</p>
        <div className="relative mt-2">
          <p className="text-gray-600 text-sm">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}</p>
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

        {/* Payment */}
        <p className="text-sm font-medium uppercase mt-4">Payment Method</p>
        <select value={paymentOption} onChange={e => setPaymentOption(e.target.value)} className="w-full bg-white px-3 py-2 mt-2 rounded text-sm">
          <option value="COD">Cash On Delivery</option>
          <option value="Online">Online Payment</option>
        </select>

        {/* Price Summary */}
        <div className="mt-4 space-y-2 text-gray-600">
          <p className="flex justify-between"><span>Price</span><span>{currency}{getCardAmount().toFixed(2)}</span></p>
          <p className="flex justify-between"><span>Shipping Fee</span><span className="text-green-600">Free</span></p>
          <p className="flex justify-between"><span>Tax (2%)</span><span>{currency}{(getCardAmount()*0.02).toFixed(2)}</span></p>
          <p className="flex justify-between text-lg font-medium mt-2"><span>Total Amount:</span><span>{currency}{(getCardAmount()*1.02).toFixed(2)}</span></p>
        </div>

        <button onClick={placeOrder} className="w-full py-3 mt-4 bg-primary text-white rounded hover:bg-dull-primary transition font-medium">
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>

        <button onClick={() => setShowInvoiceModal(true)} className="w-full py-2 mt-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm">
          View Invoice
        </button>
      </div>
    </div>
  );
};

export default Cart;
