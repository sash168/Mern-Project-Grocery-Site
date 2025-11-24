import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'sonner';

function ProductList() {
  const { products, currency, axios, fetchProducts, navigate } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState("");


  const toggleStock = async (id, inStock) => {
    try {
      const product = products.find(p => p._id === id);

      if (product.quantity === 0) {
        toast.error("Cannot toggle stock. Product quantity is 0.");
        return;
      }

      if (product.inStock === inStock) return;

      const { data } = await axios.post('/api/product/stock', { id, inStock, quantity: product.quantity });

      if (data.success) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const { data } = await axios.delete(`/api/product/delete/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (product) => {
    if (!product._id) {
      toast.error("Product ID missing!");
      return;
    }
    navigate("/seller", { state: { productToEdit: { _id: product._id } } });
  };

  // ✅ Navigate using category + id
  const handleProductClick = (product) => {
    if (!product._id || !product.category) {
      toast.error("Product category or ID missing!");
      return;
    }
    navigate(`/products/${product.category}/${product._id}`);
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full p-4 sm:p-6 md:p-10">
        <h2 className="pb-4 text-lg sm:text-xl font-semibold">All Products</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>


        <div className="w-full">
          <table className="w-full border border-gray-300 bg-white rounded-lg overflow-hidden text-gray-700">
            <thead className="bg-gray-100 text-sm sm:text-base font-medium text-gray-900">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left">Product</th>
                <th className="hidden md:table-cell px-3 sm:px-4 py-2 text-left">Category</th>
                <th className="px-3 sm:px-4 py-2 text-left">Price</th>
                <th className="px-3 sm:px-4 py-2 text-left">Qty</th>
                <th className="px-3 sm:px-4 py-2 text-left">Stock</th>
                <th className="px-3 sm:px-4 py-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm sm:text-base">
              {products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-all"
                >
                  {/* ✅ Image + name clickable to product details */}
                  <td
                    onClick={() => handleProductClick(product)}
                    className="px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 cursor-pointer hover:text-blue-600"
                  >
                    <div className="w-20 h-20 flex items-center justify-center border border-gray-300 rounded overflow-hidden">
                      <img
                        src={product.image[0]}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
                  </td>

                  <td className="hidden md:table-cell px-3 sm:px-4 py-2">{product.category}</td>

                  <td className="px-3 sm:px-4 py-2">{currency}{product.offerPrice}</td>

                  <td className="px-3 sm:px-4 py-2">{product.quantity}</td>

                  <td className="px-3 sm:px-4 py-2">
                    <label className={`relative inline-flex items-center cursor-pointer ${product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        onChange={() => toggleStock(product._id, !product.inStock)}
                        type="checkbox"
                        className="sr-only peer"
                        checked={product.inStock}
                        disabled={product.quantity === 0}
                      />
                      <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>

                  <td className="px-3 sm:px-4 py-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-gray-600 bg-gray-300 px-3 py-1 rounded transition w-full sm:w-auto"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
