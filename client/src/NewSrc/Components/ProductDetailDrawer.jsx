import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ArrowLeft, Star, Clock, Flame, Plus, Minus } from "lucide-react";

const ProductDetailDrawer = ({ product, isOpen, onClose, onAddToCart, cartItems = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Get current quantity from cart or default to 0
  const currentQuantity = cartItems.find(item => item.id === product?.id)?.quantity || 0;
  const [quantity, setQuantity] = useState(currentQuantity);

  // Update quantity when cartItems change
  React.useEffect(() => {
    const cartQuantity = cartItems.find(item => item.id === product?.id)?.quantity || 0;
    setQuantity(cartQuantity);
  }, [cartItems, product?.id]);

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onAddToCart(product.id, newQuantity);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onAddToCart(product.id, newQuantity);
    }
    // If quantity is already 0, do nothing (can't go below 0)
  };

  const handleQuantityClick = () => {
    setIsEditing(true);
    setEditValue(quantity.toString());
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(editValue) || 0;
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
      onAddToCart(product.id, newQuantity);
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


  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] md:left-4 md:right-4 md:bottom-4 md:rounded-3xl bg-white">
        {/* Header */}
        <DrawerHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200">
          <DrawerClose asChild>
            <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </DrawerClose>
          <DrawerTitle className="text-lg font-semibold text-gray-900">Details</DrawerTitle>
          <div className="w-8 h-8" /> {/* Spacer for centering */}
        </DrawerHeader>

        {/* Product Image */}
        <div className="relative h-64 bg-gradient-to-b from-green-100 to-white">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl">{product?.emoji}</div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 md:px-8 lg:px-12 space-y-4">
          {/* Product Name and Price */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{product?.name}</h3>
              <p className="text-gray-600 mt-1">{product?.size}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${product?.price}</p>
            </div>
          </div>

          {/* Attributes */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-gray-600">4.5 Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Time 10 min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">680 kcal</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enjoy farm-fresh produce, handpicked for quality, packed with nutrition, 
              and delivered with care! Well delivered fast. See more...
            </p>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <DrawerFooter className="p-6 md:px-8 lg:px-12 border-t border-gray-200 bg-white">
          {/* Quantity Selector - Full Row */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleDecrement}
              className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
            >
              <Minus className="w-5 h-5 text-green-600" />
            </button>
            {isEditing ? (
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleQuantitySubmit}
                onKeyDown={handleQuantityKeyPress}
                className="text-xl font-semibold min-w-[60px] text-center border-none outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <span 
                className="text-xl font-semibold min-w-[60px] text-center cursor-pointer hover:bg-gray-100 rounded px-3 py-2"
                onClick={handleQuantityClick}
              >
                {quantity}
              </span>
            )}
            <button
              onClick={handleIncrement}
              className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
            >
              <Plus className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ProductDetailDrawer;
