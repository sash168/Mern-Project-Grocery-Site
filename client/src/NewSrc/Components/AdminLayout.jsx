import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, Search, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductsList from './ProductsList';
import CartSummary from './CartSummary';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for cart updates
    const handleCartUpdate = (event) => {
      setCartItems(event.detail);
    };
    window.addEventListener('cartUpdate', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
  };

  const handleQuantityChange = (productId, quantity) => {
    const products = [
      { id: 1, name: "Fresh Apples", emoji: "🍎", price: "2.99", size: "1 kg" },
      { id: 2, name: "Banana Bunch", emoji: "🍌", price: "1.49", size: "6 pieces" },
      { id: 3, name: "Organic Milk", emoji: "🥛", price: "3.99", size: "1 liter" },
      { id: 4, name: "Whole Wheat Bread", emoji: "🍞", price: "2.49", size: "1 loaf" },
      { id: 5, name: "Fresh Spinach", emoji: "🥬", price: "1.99", size: "200g" },
      { id: 6, name: "Greek Yogurt", emoji: "🥄", price: "4.49", size: "500g" },
      { id: 7, name: "Orange Juice", emoji: "🍊", price: "3.29", size: "1 liter" },
      { id: 8, name: "Chicken Breast", emoji: "🍗", price: "8.99", size: "1 kg" },
      { id: 9, name: "Brown Rice", emoji: "🍚", price: "2.79", size: "1 kg" },
      { id: 10, name: "Avocado", emoji: "🥑", price: "1.89", size: "1 piece" },
      { id: 11, name: "Fresh Strawberries", emoji: "🍓", price: "4.99", size: "250g" },
      { id: 12, name: "Eggs", emoji: "🥚", price: "3.49", size: "12 pieces" },
    ];

    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);

      if (quantity === 0) {
        // Remove item from cart
        return prevItems.filter(item => item.id !== productId);
      } else if (existingItem) {
        // Update existing item
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Greeting */}
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-800">
                Hi, {user?.username || 'Admin'}
              </h1>
            </div>
            
            {/* Right: User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-md p-1">
                <DropdownMenuItem 
                  onClick={() => handleNavigation('users')} 
                  className="cursor-pointer px-3 py-2 text-sm rounded-sm hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 transition-all duration-150 ease-in-out"
                >
                  Users
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNavigation('products')} 
                  className="cursor-pointer px-3 py-2 text-sm rounded-sm hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200 transition-all duration-150 ease-in-out"
                >
                  Products
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-600 cursor-pointer px-3 py-2 text-sm rounded-sm hover:bg-red-50 focus:bg-red-50 active:bg-red-100 transition-all duration-150 ease-in-out"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Tabs Section */}
      <div className="bg-white">
        <div className="px-4 pt-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-10">
              <TabsTrigger 
                value="orders" 
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="cart" 
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
              >
                Cart
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-0">
              <div className="py-4 px-4 md:px-8 lg:px-16 xl:px-24">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">Available Products</h2>
                    <div className="flex items-center space-x-2">
                      {/* Search Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSearch(!showSearch)}
                        className="h-8 w-8 p-0"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      
                      {/* Filter Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => alert('Filter functionality coming soon!')}
                        className="h-8 w-8 p-0"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search Input */}
                  {showSearch && (
                    <div className="mb-4">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">Tap the + button to add items to your cart</p>
                </div>
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                          <ProductsList onQuantityChange={handleQuantityChange} searchQuery={searchQuery} cartItems={cartItems} />
                        </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cart" className="mt-0">
              <div className="py-4 px-4 md:px-8 lg:px-16 xl:px-24">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Cart</h2>
                  <p className="text-sm text-gray-600">
                    {cartItems.length > 0 
                      ? `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in cart`
                      : 'No items in cart yet'
                    }
                  </p>
                </div>
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  <CartSummary cartItems={cartItems} onClearCart={handleClearCart} onQuantityChange={handleQuantityChange} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
