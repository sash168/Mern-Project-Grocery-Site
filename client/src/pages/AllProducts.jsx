import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard';

function AllProducts() {
    const { products, searchQuery } = useAppContext();
    const [filteredProduct, setFilteredProduct] = useState([]);

    useEffect(() => {
        const inStockProducts = products.filter(p => p.inStock);

        if (searchQuery.length > 0) {
            setFilteredProduct(
                inStockProducts.filter(product =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProduct(inStockProducts);
        }
    }, [products, searchQuery]);


    return (
        <div className="mt-20 px-3 sm:px-6 md:px-16">
            <div className="flex flex-col items-end w-max mx-auto md:mx-0">
                <p className="text-2xl md:text-3xl font-semibold uppercase tracking-wide">
                    All Products
                </p>
                <div className="w-20 h-1 bg-primary rounded-full mt-1"></div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-10 justify-items-center">
                {filteredProduct
                    .map((product, ind) => (
                        <ProductCard product={product} key={ind} />
                    ))}
            </div>
        </div>
    );
}

export default AllProducts;
