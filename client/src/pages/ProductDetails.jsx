import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
    const { products, navigate, currency, addToCart } = useAppContext();
    const { id } = useParams();

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find(item => item._id == id);

    // Set related products
    useEffect(() => {
        if (products.length > 0 && product) {
            const related = products.filter(item => item.category === product.category && item._id !== product._id);
            setRelatedProducts(related.slice(0, 5));
        }
    }, [products, product]);

    // Set initial thumbnail
    useEffect(() => {
        setThumbnail(product?.image[0] || null);
    }, [product]);

    if (!product) return null;

    return (
        <div className="mt-16 px-4 md:px-16">
            {/* Breadcrumbs */}
            <p className="text-sm text-gray-500">
                <Link to="/">Home</Link> /
                <Link to="/products"> Products</Link> /
                <Link to={`/product/${product.category.toLowerCase()}`}> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            {/* Product Section */}
            <div className="flex flex-col md:flex-row gap-10 mt-6">
                {/* Images */}
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    {/* Big Image */}
                    <div className="w-full border border-gray-300 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" className="w-full object-cover rounded"/>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide">
                        {product.image.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => setThumbnail(img)}
                                className={`border rounded cursor-pointer p-1 ${thumbnail === img ? "border-primary" : "border-gray-300"}`}
                            >
                                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-16 h-16 object-cover rounded"/>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>

                    <div className="flex items-center gap-1">
                        {Array(5).fill("").map((_, i) => (
                            <img
                                key={i}
                                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                                className="w-4 h-4"
                            />
                        ))}
                        <span className="text-gray-500 ml-2">(4)</span>
                    </div>

                    <div>
                        <p className="text-gray-400 line-through">MRP: {currency}{product.price}</p>
                        <p className="text-2xl font-semibold">{currency}{product.offerPrice}</p>
                        <span className="text-gray-500 text-sm">(inclusive of all taxes)</span>
                    </div>

                    <div>
                        <p className="font-medium">About Product:</p>
                        <ul className="list-disc ml-5 text-gray-500">
                            {product.description.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-sm text-gray-500">
                        {product.quantity > 0 ? `${product.quantity} left in stock` : "Out of stock"}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            onClick={() => addToCart(product._id)}
                            disabled={product.quantity <= 0}
                            className="w-full py-3 text-gray-800 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => { addToCart(product._id); navigate("/cart"); }}
                            className="w-full py-3 bg-primary text-white hover:bg-dull-primary rounded font-medium transition"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="flex flex-col items-center mt-20">
                <div className="flex flex-col items-center w-max">
                    <p className="font-medium text-3xl">Related Products</p>
                    <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
                </div>

                <div className="w-full mt-6">
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2 sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
                        {relatedProducts.map((product, index) => (
                            <div key={index} className="min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink md:flex-shrink-0">
                                <ProductCard product={product}/>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => { navigate(`/products`); scrollTo(0,0); }}
                    className="mx-auto my-16 px-12 py-2.5 border rounded text-primary hover:bg-primary/10 transition"
                >
                    See More
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
