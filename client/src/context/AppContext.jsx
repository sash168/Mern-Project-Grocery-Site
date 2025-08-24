// AppContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from 'axios';

// Axios setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get('/api/seller/is-auth');
      if (data.success) {
        setIsSeller(true)
      } else {
        setIsSeller(false);
      }
  
    } catch {
      setIsSeller(false);
    }
  };

  //fetch user auth status, user data and cart items for user

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/user/is-auth');
      if (data.success) {
        setUser(data.user)
        setCartItems(data.user.cartItems)
      }
    } catch (error) {
      setUser(null);
    }
  }


  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  const addToCart = (itemId) => {
    const cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + 1;
    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  const updateCartItem = (itemId, quantity) => {
    const cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Updated Successfully");
  };

  const removeFromCart = (itemId) => {
    const cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) delete cartData[itemId];
    }
    setCartItems(cartData);
    toast.success("Removed item");
  };

  const getCardCount = () =>
    Object.values(cartItems).reduce((acc, val) => acc + val, 0);

  const getCardAmount = () => {
    let total = 0;
    for (const item in cartItems) {
      const info = products.find((p) => p._id == item);
      if (info) total += info.offerPrice * cartItems[item];
    }
    return Math.floor(total * 100) / 100;
  };

  useEffect(() => {
      fetchProducts();
      fetchSeller();
      fetchUser();
  }, []);

  //update cart item for user
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post('/api/cart/update', { cartItems })
        console.log("sash cartItems : " + cartItems);
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    if (user) {
      updateCart();
    }
  },[cartItems])

  const value = {
    navigate,
    user, setUser,
    isSeller, setIsSeller,
    showUserLogin, setShowUserLogin,
    products,
    addToCart,
    currency,
    removeFromCart,
    cartItems,
    updateCartItem,
    searchQuery, setSearchQuery,
    getCardAmount,
    getCardCount,
    axios,
    fetchProducts,
    setCartItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => useContext(AppContext);

export { AppContextProvider, useAppContext };