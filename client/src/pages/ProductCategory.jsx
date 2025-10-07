import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

function ProductCategory() {
    const { products } = useAppContext();
    const { category } = useParams();

    const searchCategory = categories.find(
        (item) => item.path.toLowerCase() === category
    );

    const filteredProducts = products.filter(
        (product) => product.category.toLowerCase() === category
    );

    return (
        <div className='mt-16 px-2 md:px-0'>
            {searchCategory && (
                <div className='flex flex-col items-end w-max mb-4'>
                    <p className='text-2xl font-medium'>
                        {searchCategory.text.toUpperCase()}
                    </p>
                    <div className='w-16 h-0.5 bg-primary rounded-full'></div>
                </div>
            )}

            {filteredProducts.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-6'>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className='flex items-center justify-center h-[40vh]'>
                    <p className='text-2xl font-medium'>
                        No product found for this category
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProductCategory;
