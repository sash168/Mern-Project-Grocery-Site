import React from 'react'
import { categories } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

function Categories() {
  const { navigate } = useAppContext()

  return (
    <div className="mt-12 sm:mt-16">
      <p className="text-2xl md:text-3xl font-medium mb-4 sm:mb-6">Categories</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-6">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group cursor-pointer py-5 px-3 rounded-lg flex flex-col justify-center items-center text-center transition-transform duration-300"
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`)
              scrollTo(0, 0)
            }}
          >
            <img
              src={category.image}
              alt={category.text}
              className="group-hover:scale-110 transition-transform duration-300 w-16 sm:w-20 md:w-24"
            />
            <p className="text-xs sm:text-sm font-medium mt-2 text-gray-700">
              {category.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories
