import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

function MainBanner() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Image container */}
      <div className="relative w-full h-[25vh] md:h-[60vh] sm:h-[55vh] overflow-hidden">
        {/* Desktop Image */}
        <img
          src={assets.main_banner_bg}
          alt="Banner"
          className="hidden md:block w-full h-auto object-contain translate-y-[-30%]"
        />
        {/* Mobile Image */}
        <img
          src={assets.main_banner_bg_sm}
          alt="Banner"
          className="w-full h-auto md:hidden object-contain translate-y-[-5%]"
        />

        {/* Buttons */}
        <div
            className="
              absolute
              top-[70%] left-1/2 -translate-x-1/2   /* center button on mobile */
              sm:top-[75%] sm:left-[22%] sm:translate-x-0
              md:top-[65%] md:left-[22%]
              flex flex-col sm:flex-row items-center gap-3 sm:gap-4
            "
          >

          {/* Shop Now — visible on all screens */}
          <Link
            to="/products"
            className="
              group flex items-center justify-center gap-2 
              px-3 py-1.5 text-sm              /* smaller button for mobile */
              sm:px-6 sm:py-2 sm:text-base     /* normal size for tablet+ */
              bg-primary hover:bg-dull-primary 
              text-white rounded-md 
              transition duration-200
            "
          >
            Shop Now
          </Link>

          {/* Explore Deals — visible only on desktop */}
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 px-6 sm:px-8 py-3 bg-white/90 hover:bg-white text-black rounded-md transition duration-200"
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
