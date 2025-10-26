import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

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

  const addressRef = useRef(null); // ref for dropdown

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
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Close address dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addressRef.current && !addressRef.current.contains(e.target)) {
        setShowAddress(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (products.length > 0 && cartItems) getCart();
  }, [products, cartItems]);

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  const placeOrder = async () => {
    if (!selectedAddress || !selectedAddress._id)
      return toast.error("Please select a valid address");

    try {
      const { data } = await axios.post("/api/order/cod", {
        userId: user._id,
        items: cartArray.map((item) => ({ product: item._id, quantity: item.quantity })),
        address: selectedAddress._id,
      });

      if (data.success) {
        toast.success(data.message);

        // Update product stock locally
        const updatedProducts = products.map((product) => {
          const orderedItem = cartArray.find((item) => item._id === product._id);
          if (orderedItem)
            return { ...product, quantity: product.quantity - orderedItem.quantity };
          return product;
        });

        setCartItems({});
        setProducts(updatedProducts);
        navigate("/my-orders");
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
          Shopping Cart{" "}
          <span className="text-primary text-base">{getCardCount()} Items</span>
        </h1>

        {cartArray.map((product) => (
          <div
            key={product._id}
            className="flex flex-col sm:flex-row md:grid md:grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium gap-4 md:gap-0 p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-4 w-full md:flex-none cursor-pointer">
              <div
                className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden"
                onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <p
                  className="font-semibold"
                  onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}
                >
                  {product.name}
                </p>
                <p className="text-gray-500 text-sm">Size: {product.weight || "N/A"}</p>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Qty:</p>
                    <select
                      value={cartItems[product._id]}
                      onChange={(e) => updateCartItem(product._id, Number(e.target.value))}
                      className="border px-2 py-1 rounded text-sm"
                    >
                      {Array.from({ length: product.stock }, (_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm">Out of stock</p>
                )}
              </div>
            </div>

            <p className="text-center md:text-left text-lg font-medium">
              {currency}{(product.offerPrice * product.quantity).toFixed(2)}
            </p>

            <div className="flex justify-center md:justify-start">
              <button
                onClick={() => removeFromCart(product._id)}
                className="hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-primary font-medium mt-4"
        >
          Continue Shopping
        </button>
      </div>

      {/* ORDER SUMMARY */}
      <div className="w-full md:w-[360px] bg-gray-50 p-5 rounded-lg flex-shrink-0 self-start">
        <h2 className="text-xl font-medium mb-4">Order Summary</h2>

        <p className="text-sm font-medium uppercase mt-4">Delivery Address *</p>
        <div className="relative mt-2" ref={addressRef}>
          <p className="text-gray-600 text-sm">
            {selectedAddress
              ? [
                  `${selectedAddress.firstName} ${selectedAddress.lastName}`,
                  selectedAddress.street,
                  selectedAddress.city,
                  selectedAddress.state,
                  selectedAddress.country,
                  selectedAddress.phone
                ].filter(Boolean).join(", ")
              : "No address selected"}
          </p>

          <button
            onClick={() => setShowAddress((prev) => !prev)}
            className="text-primary hover:underline text-sm"
          >
            Change
          </button>

          {showAddress && (
            <div className="absolute z-10 top-8 w-full bg-white rounded p-2 shadow-md">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="flex justify-between items-center p-1 hover:bg-gray-100 rounded text-sm mt-1"
                >
                  <p
                    className="cursor-pointer flex-1"
                    onClick={() => {
                      setSelectedAddress(address);
                      setShowAddress(false);
                    }}
                  >
                    {`${address.firstName} ${address.lastName}, ${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.phone}`}
                  </p>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const { data } = await axios.delete(`/api/address/delete/${address._id}`);
                        if (data.success) {
                          toast.success("Address deleted");
                          setAddresses((prev) => prev.filter((a) => a._id !== address._id));
                          if (selectedAddress?._id === address._id) setSelectedAddress(null);
                        } else toast.error(data.message);
                      } catch (err) {
                        toast.error(err.message);
                      }
                    }}
                    className="hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <p
                onClick={() => navigate("/add-address")}
                className="cursor-pointer text-primary text-center mt-2 p-1 hover:bg-primary/10 rounded text-sm"
              >
                Add address
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 text-gray-600">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCardAmount().toFixed(2)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-2">
            <span>Total Amount:</span>
            <span>{currency}{getCardAmount().toFixed(2)}</span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={!selectedAddress}
          className={`w-full py-3 mt-4 rounded font-medium transition ${
            selectedAddress
              ? "bg-primary text-white hover:bg-dull-primary"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Cart;

