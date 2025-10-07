import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

function BestSeller() {
  const { products } = useAppContext()

  return (
    <div className="mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-6 lg:px-8">
      <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
        Best Sellers
      </p>

      <div className='grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mt-6'>
        {products.filter(product => product.inStock).slice(0,5).map((product,index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

    </div>
  )
}

export default BestSeller
