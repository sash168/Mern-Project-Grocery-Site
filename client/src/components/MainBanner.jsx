import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

function MainBanner() {
  return (
    <div className='relative w-full'>
      {/* Background images */}
      <img src={assets.main_banner_bg} alt='Banner' className='w-full hidden md:block' />
      <img src={assets.main_banner_bg_sm} alt='Banner' className='w-full md:hidden' />

      {/* Content overlay */}
      <div className='absolute inset-0 flex flex-col items-start justify-end md:justify-center pb-16 md:pb-0 px-4 md:pl-24 lg:pl-32'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg leading-snug'>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, nostrum.
        </h1>

        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6'>
          <Link
            to={'/products'}
            className='group flex items-center gap-2 px-6 sm:px-8 md:px-9 py-2 md:py-3 bg-primary hover:bg-dull-primary text-white rounded transition cursor-pointer'
          >
            Shop Now
            <img
              src={assets.white_arrow_icon}
              alt='arrow'
              className='md:hidden w-4 h-4 transition group-hover:translate-x-1'
            />
          </Link>

          <Link
            to={'/products'}
            className='group hidden md:flex items-center gap-2 px-8 py-3 rounded text-black transition cursor-pointer'
          >
            Explore Deals
            <img
              src={assets.black_arrow_icon}
              alt='arrow'
              className='w-4 h-4 transition group-hover:translate-x-1'
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainBanner;
