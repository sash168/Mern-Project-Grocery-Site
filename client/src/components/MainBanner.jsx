import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

function MainBanner() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* ✅ Mobile & tablet view: Entire banner clickable */}
      <Link
        to="/products"
        className="block sm:hidden relative w-full h-[25vh] overflow-hidden"
      >
        <img
          src={assets.main_banner_bg_sm}
          alt="Banner"
          className="w-full h-auto object-contain translate-y-[-5%]"
        />
      </Link>

      {/* ✅ Desktop & larger: Only buttons clickable */}
      <div className="hidden sm:block relative w-full h-[55vh] md:h-[60vh] overflow-hidden">
        {/* Banner Image */}
        <img
          src={assets.main_banner_bg}
          alt="Banner"
          className="w-full h-auto object-contain translate-y-[-30%]"
        />

        {/* Buttons */}
        <div
          className="
            absolute
            top-[75%] left-[22%]
            md:top-[65%] flex flex-row items-center gap-4
          "
        >
          {/* Shop Now */}
          <Link
            to="/products"
            className="
              flex items-center justify-center gap-2 
              px-6 py-2 text-base
              bg-primary hover:bg-dull-primary 
              text-white rounded-md 
              transition duration-200
            "
          >
            Shop Now
          </Link>

          {/* Explore Deals */}
          <Link
            to="/products"
            className="
              hidden md:flex items-center gap-2 
              px-8 py-3 bg-white/90 hover:bg-white 
              text-black rounded-md transition duration-200
            "
          >
            Explore Deals
            <img
              src={assets.black_arrow_icon}
              alt="arrow"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainBanner;
