import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus } from "lucide-react";

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.quantity.toString());

  const handleIncrement = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    } else {
      onRemove(item.id);
    }
  };

  const handleQuantityClick = () => {
    setIsEditing(true);
    setEditValue(item.quantity.toString());
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(editValue) || 1;
    if (newQuantity > 0) {
      onQuantityChange(item.id, newQuantity);
    }
    setIsEditing(false);
  };

  const handleQuantityKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(item.quantity.toString());
    }
  };

  return (
    <div className="bg-green-50 rounded-lg p-4 mb-3 mx-0 md:mx-0">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <div className="text-3xl">{item.emoji}</div>
        </div>
        
        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Product Name and X Button */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h3>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Size */}
          <p className="text-gray-600 text-xs mb-3">{item.size}</p>
          
          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">${item.price}</span>
            
            {/* Quantity Selector */}
            <div className="flex items-center bg-white rounded-full border border-gray-300 px-2 py-1">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <Minus className="h-3 w-3 text-gray-600" />
              </button>
              {isEditing ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleQuantitySubmit}
                  onKeyDown={handleQuantityKeyPress}
                  className="text-sm font-medium min-w-[24px] text-center mx-2 border-none outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-sm font-medium min-w-[24px] text-center mx-2 cursor-pointer hover:bg-gray-100 rounded px-1"
                  onClick={handleQuantityClick}
                >
                  {item.quantity}
                </span>
              )}
              <button
                onClick={handleIncrement}
                className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <Plus className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSummary = ({ cartItems, onClearCart, onQuantityChange }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const discount = subtotal * 0.1; // 10% discount
  const totalPrice = (subtotal - discount).toFixed(2);

  const handleRemove = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    window.dispatchEvent(new CustomEvent('cartUpdate', { detail: updatedItems }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-lg font-medium">Cart is empty</p>
        <p className="text-sm">Add some items from the Orders tab</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-white rounded-t-3xl p-4 min-h-screen">
          {/* Mobile Header with Clear Cart Button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Cart</h2>
            <button
              onClick={onClearCart}
              className="text-red-600 text-sm font-medium hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-6">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>

          {/* Show More Items */}
          {cartItems.length > 3 && (
            <div className="text-center mb-6">
              <button className="text-blue-600 text-sm font-medium">
                Show {cartItems.length - 3} more items
              </button>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-red-600 font-medium">10%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total ({totalItems} items)</span>
                <span className="font-bold text-lg">${totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg text-lg">
            Checkout
          </Button>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Cart Items */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shopping Cart</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onQuantityChange={onQuantityChange}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-red-600 font-medium">10%</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total ({totalItems} items)</span>
                      <span className="font-bold text-lg">${totalPrice}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg">
                      Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onClearCart}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;