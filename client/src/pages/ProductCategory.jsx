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
        (product) => 
            product.category.toLowerCase() === category &&
            product.inStock
    );


    return (
        <div className="mt-20 px-3 sm:px-6 md:px-16">
            {searchCategory && (
                <div className="flex flex-col items-end w-max mx-auto md:mx-0 mb-4">
                    <p className="text-2xl md:text-3xl font-semibold uppercase tracking-wide">
                        {searchCategory.text}
                    </p>
                    <div className="w-20 h-1 bg-primary rounded-full mt-1"></div>
                </div>
            )}

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-10 justify-items-center">
                    {filteredProducts
                        .map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-[40vh]">
                    <p className="text-2xl font-medium text-gray-600">
                        No products found for this category
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProductCategory;
