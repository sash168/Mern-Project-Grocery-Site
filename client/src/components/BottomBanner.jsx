import React from 'react';
import { features } from '../assets/assets';

function BottomBanner() {
  return (
    <div className="mt-8 sm:mt-16 lg:mt-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary mb-6">
          Why Are We Best?
        </h1>

        {/* Feature Row */}
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-8 sm:gap-10 flex-wrap">
          {features.map((feature, ind) => (
            <div
              key={ind}
              className="flex flex-col justify-between items-center text-center border border-gray-200 rounded-2xl px-6 py-8 sm:px-8 sm:py-10 w-[90%] sm:w-[45%] md:w-[22%] min-h-[250px] transition-transform hover:-translate-y-1 hover:shadow-lg bg-white"
            >
              <img
                src={feature.icon}
                alt={feature.title}
                className="w-12 sm:w-14 mb-4"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BottomBanner;
