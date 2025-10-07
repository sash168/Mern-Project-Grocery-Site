import React, { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';

function ProductList() {
  const { products, currency, axios,fetchProducts } = useAppContext();

  const toggleStock = async (id, inStock) => {
    try {
      const product = products.find(p => p._id === id);
      const { data } = await axios.post('/api/product/stock', { id, inStock, quantity: product.quantity })
      
      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  
  // Automatically mark out-of-stock products as not in stock
  useEffect(() => {
    const updateOutOfStock = async () => {
      for (const product of products) {
        if (product.quantity === 0 && product.inStock) {
          try {
            await axios.post('/api/product/stock', { id: product._id, inStock: false });
          } catch (error) {
            console.log('Error updating stock for', product.name);
          }
        }
      }
    };

    if (products.length > 0) updateOutOfStock();
  }, [products]);

  return (
    <div className="no-scollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                <th className="px-4 py-3 font-semibold truncate">Quantity</th> 
                <th className="px-4 py-3 font-semibold truncate">In Stock</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product) => (
                <tr key={product._id} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <img src={product.image[0]} alt="Product" className="w-16" />
                    </div>
                    <span className="truncate max-sm:hidden w-full">{product.name}</span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 max-sm:hidden">{currency}{product.offerPrice}</td>
                  <td className="px-4 py-3">{product.quantity}</td>
                  <td className="px-4 py-3">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input onChange={() => toggleStock(product._id, !product.inStock)} type="checkbox" className="sr-only peer" checked={product.inStock} />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList