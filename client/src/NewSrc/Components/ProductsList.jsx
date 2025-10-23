import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";
import ProductDetailDrawer from './ProductDetailDrawer';

const ProductCard = ({ product, onQuantityChange, onCardClick, cartItems = [] }) => {
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Sync with cart items
  useEffect(() => {
    const cartItem = cartItems.find(item => item.id === product.id);
    setQuantity(cartItem ? cartItem.quantity : 0);
  }, [cartItems, product.id]);

  const handleIncrement = (e) => {
    e.stopPropagation(); // Prevent card click
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(product.id, newQuantity);
  };

  const handleDecrement = (e) => {
    e.stopPropagation(); // Prevent card click
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(product.id, newQuantity);
    }
  };

  const handleQuantityClick = (e) => {
    e.stopPropagation(); // Prevent card click
    setIsEditing(true);
    setEditValue(quantity.toString());
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(editValue) || 1;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
      onQuantityChange(product.id, newQuantity);
    }
    setIsEditing(false);
  };

  const handleQuantityKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(quantity.toString());
    }
  };

  const handleCardClick = () => {
    onCardClick(product);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card click
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <Card 
        className="w-full hover:shadow-lg transition-all duration-200 border-0 bg-white cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative">
            <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
              <div className="text-4xl">{product.emoji}</div>
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <Heart 
                className={`w-3 h-3 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
              />
            </button>
          </div>

          {/* Product Details */}
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-green-600 font-bold text-sm">
                  ${product.price}
                </p>
                <p className="text-gray-500 text-xs">
                  {product.size}
                </p>
              </div>
            </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      {quantity > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDecrement}
                            className="h-7 w-7 p-0 rounded-full border-gray-300"
                          >
                            <span className="text-xs">-</span>
                          </Button>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleQuantitySubmit}
                              onKeyDown={handleQuantityKeyPress}
                              className="text-sm font-medium min-w-[20px] text-center border-none outline-none bg-transparent"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className="text-sm font-medium min-w-[20px] text-center cursor-pointer hover:bg-gray-100 rounded px-1"
                              onClick={handleQuantityClick}
                            >
                              {quantity}
                            </span>
                          )}
                          <Button
                            size="sm"
                            onClick={handleIncrement}
                            className="h-7 w-7 p-0 rounded-full bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleIncrement}
                          className="h-7 w-7 p-0 rounded-full bg-green-600 hover:bg-green-700 ml-auto"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const ProductsList = ({ onQuantityChange, searchQuery = '', cartItems = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (productId, quantity) => {
    onQuantityChange(productId, quantity);
  };

  return (
    <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuantityChange={onQuantityChange}
                    onCardClick={handleCardClick}
                    cartItems={cartItems}
                  />
                ))}
              </div>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
      />
    </>
  );
};

export default ProductsList;
