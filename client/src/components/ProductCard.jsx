import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { addToCart, currency, removeFromCart, cartItems, navigate } = useAppContext();

  const isOutOfStock = !product.inStock || product.quantity <= 0;
  const inCart = !!cartItems[product._id];

  return (
    product && (
      <div
        onClick={() => {
          navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
          scrollTo(0, 0);
        }}
        className={`relative border border-gray-500/20 rounded-md p-3 md:p-4 bg-white w-full flex flex-col justify-between transition hover:shadow-md ${
          isOutOfStock ? "opacity-80" : ""
        }`}
      >
        {/* Image Section */}
        <div className="relative flex items-center justify-center h-48">
          <img
            className="group-hover:scale-105 transition w-full h-full object-contain"
            src={product.image[0]}
            alt={product.name}
          />

          {/* Out of Stock Badge (on top of image only) */}
          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between flex-1 mt-3">
          <div>
            <p className="text-gray-500/70 text-xs uppercase">{product.category}</p>
            <p className="text-gray-800 font-medium text-lg truncate">{product.name}</p>

            {/* Rating */}
            <div className="flex items-center gap-0.5 mt-1">
              {Array(5)
                .fill("")
                .map((_, i) => (
                  <img
                    key={i}
                    className="w-4 h-4"
                    src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt=""
                  />
                ))}
              <p className="text-gray-500 text-xs">(4)</p>
            </div>
          </div>

          {/* Price + Add Button */}
          <div className="flex items-end justify-between mt-3">
            <p className="md:text-lg text-base font-medium text-primary">
              {currency}
              {product.offerPrice}{" "}
              <span className="text-gray-400 md:text-sm text-xs line-through">
                {currency}
                {product.price}
              </span>
            </p>

            <div onClick={(e) => e.stopPropagation()} className="text-primary">
              {isOutOfStock ? (
                <button
                  className="flex items-center justify-center gap-1 bg-gray-200 text-gray-400 border border-gray-300 w-20 h-9 rounded cursor-not-allowed"
                  disabled
                >
                  <img src={assets.cart_icon} alt="cart_icon" className="opacity-50" />
                  Add
                </button>
              ) : !inCart ? (
                <button
                  className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-20 h-9 rounded hover:bg-primary/20 transition"
                  onClick={() => addToCart(product._id)}
                >
                  <img src={assets.cart_icon} alt="cart_icon" />
                  Add
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 w-20 h-9 bg-primary/25 rounded select-none">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    -
                  </button>
                  <span className="w-5 text-center">{cartItems[product._id]}</span>
                  <button
                    onClick={() => addToCart(product._id)}
                    className="cursor-pointer text-md px-2 h-full"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductCard;
