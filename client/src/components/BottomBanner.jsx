import React from 'react'
import { assets, features } from '../assets/assets'

function BottomBanner() {
  return (
    <div className="relative mt-16 sm:mt-20 md:mt-24">
      {/* ✅ Responsive banner images */}
      <img
        src={assets.bottom_banner_image}
        alt="banner"
        className="w-full hidden md:block object-cover"
      />
      <img
        src={assets.bottom_banner_image_sm}
        alt="banner"
        className="w-full md:hidden object-cover"
      />

      {/* ✅ Overlay content positioning */}
      <div className="absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-12 sm:pt-16 md:pt-0 md:pr-24 px-4 text-center md:text-right">
        <div className="max-w-md md:max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary mb-6">
            Why Are We Best?
          </h1>

          {/* ✅ Responsive feature list */}
          {features.map((feature, ind) => (
            <div className="flex items-center gap-3 sm:gap-4 mt-3" key={ind}>
              <img
                src={feature.icon}
                alt={feature.title}
                className="w-8 sm:w-9 md:w-10"
              />
              <div className="text-left md:text-right">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="text-gray-500/70 text-xs sm:text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomBanner
