import React from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom'

function MainBanner() {
  return (
    <div className='relative'>
        <img src={assets.main_banner_bg} alt='Banner' className='w-full hidden md:block' />
        <img src={assets.main_banner_bg_sm} alt='Banner' className='w-full md:hidden' />
          <div className='absolute inset-0 flex flex-col items-left justify-end md:justify-center pb-24 md:pb-0 px-4 md:pl-24 lg:pl-24'>
              <h1 className='text-3xl md:text-3xl lg:text-3xl text-left max-w-72 md:max-w-80 lg:max-w-105'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, nostrum.</h1> 
          <div className='flex items-center mt-6 font-medium'>
              <Link to={'/products'} className='group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-dull-primary 
              transition rounded text-white cursor-pointed'>
                Shop Now
                <img src={assets.white_arrow_icon} alt='arrow' className='md:hidden transition group-focus:translate-x-1'/>
              </Link>
              <Link to={'/products'} className='group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer'>
                Explore Deals
                <img src={assets.black_arrow_icon} alt='arrow' className='transition group-hover:translate-x-1'/>
              </Link>
            </div>
            </div>
    </div>
     
      
    
  )
}

export default MainBanner