import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard';

function AllProducts() {
    const { products, searchQuery } = useAppContext();
    const [filteredProduct, setFilteredProduct] = useState([]);

    useEffect(() => {
        if (searchQuery.length > 0) {
            setFilteredProduct(
                products.filter(product => 
                    product.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredProduct(products);
        }
    }, [products, searchQuery]);

    return (
        <div className='mt-16 px-4 md:px-16'>
            <div className='flex flex-col items-end w-max'>
                <p className="text-2xl font-medium uppercase">ALL PRODUCTS</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            <div className='grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mt-6'>
                {filteredProduct.filter(product => product.inStock).map((product, ind) => (
                    <ProductCard product={product} key={ind}/>
                ))}
            </div>
        </div>
    )
}

export default AllProducts;
