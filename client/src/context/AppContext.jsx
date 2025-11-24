import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "sonner";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const [lastFetch, setLastFetch] = useState(0);

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // ----------------------------------------------------------------
  // CHECK SELLER AUTH
  // ----------------------------------------------------------------
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      setIsSeller(!!data.success);
    } catch (error) {
      setIsSeller(false);
      toast.error("Seller authentication failed");
    }
  };

  // ----------------------------------------------------------------
  // CHECK USER AUTH
  // ----------------------------------------------------------------
  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/is-auth');
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      }
    } catch (error) {
      setUser(null);
      toast.error("Session expired. Please login again");
    }
  };

  // ----------------------------------------------------------------
  // FETCH PRODUCTS
  // ----------------------------------------------------------------
  const fetchProducts = async () => {
  try {
    const res = await axios.get("/api/product/list", {
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    setProducts(res.data.products);
  } catch (e) {
    console.log("Error fetching products:", e);
  }
};


  // ----------------------------------------------------------------
  // CART FUNCTIONS
  // ----------------------------------------------------------------

  // ADD TO CART
  const addToCart = (itemId) => {
    const product = products.find(p => p._id === itemId);
    if (!product) return;

    const currentQty = cartItems[itemId] || 0;

    if (product.quantity <= 0) {
      deleteItemFromCart(itemId);
      toast.error(`${product.name} is now out of stock`);
      return;
    }

    if (currentQty + 1 > product.quantity) {
      toast.error(`Only ${product.quantity} left in stock`);
      return;
    }

    setCartItems(prev => ({
      ...prev,
      [itemId]: currentQty + 1,
    }));
  };

  // UPDATE QUANTITY
  const updateCartItem = (itemId, quantity) => {
    setCartItems(prev => ({ ...prev, [itemId]: quantity }));
  };

  // REMOVE ITEM
  const removeFromCart = (itemId) => {
    const qty = cartItems[itemId] || 0;

    if (qty > 1) {
      updateCartItem(itemId, qty - 1);
    } else {
      setCartItems(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }
  };

  const deleteItemFromCart = (id) => {
    setCartItems(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };


  // TOTAL COUNT
  const getCardCount = () =>
    Object.values(cartItems).reduce((acc, val) => acc + val, 0);

  // TOTAL COST
  const getCardAmount = () => {
    return Object.entries(cartItems).reduce((total, [id, qty]) => {
      const product = products.find(p => p._id === id);
      return product ? total + product.offerPrice * qty : total;
    }, 0);
  };

  // ----------------------------------------------------------------
  // INIT FETCH CALLS
  // ----------------------------------------------------------------
  useEffect(() => {
    fetchProducts();
    fetchSeller();
    fetchUser();
  }, []);

  // AUTO REMOVE ITEMS IF PRODUCT OUT OF STOCK
  useEffect(() => {
    products.forEach(product => {
      const qtyInCart = cartItems[product._id];

      // If the item is in cart & product is now zero stock
      if (qtyInCart && product.quantity <= 0) {
        deleteItemFromCart(product._id);
        toast.error(`${product.name} is now out of stock`);
      }

      // If cart quantity exceeds updated stock
      if (qtyInCart && qtyInCart > product.quantity) {
        updateCartItem(product._id, product.quantity);
        toast.error(
          `${product.name} stock changed, quantity updated to ${product.quantity}`
        );
      }
    });
  }, [products]);


  // ----------------------------------------------------------------
  // SYNC CART TO DATABASE
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const updateCart = async () => {
      try {
        const { data } = await axios.post('/api/cart/update', { cartItems });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    updateCart();
  }, [cartItems]);

  // ----------------------------------------------------------------
  // APP CONTEXT VALUE
  // ----------------------------------------------------------------
  const value = {
    navigate,
    user, setUser,
    isSeller, setIsSeller,
    showUserLogin, setShowUserLogin,
    products, setProducts,
    cartItems, setCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    getCardCount,
    getCardAmount,
    searchQuery, setSearchQuery,
    currency,
    axios,
    fetchProducts,
    deleteItemFromCart
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
export { AppContextProvider };
