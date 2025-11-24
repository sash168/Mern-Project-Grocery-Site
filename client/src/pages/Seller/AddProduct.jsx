import React, { useState, useEffect } from 'react';
import { assets, categories } from "../../assets/assets";
import { useAppContext } from '../../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function AddProduct() {
  const { axios, fetchProducts } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const productToEditId = location.state?.productToEdit?._id;

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState(''); 
  const [quantity, setQuantity] = useState('');

  // Prefill form for edit
  useEffect(() => {
    if (!productToEditId) return;

    const fetchProduct = async () => {
        try {
        const { data } = await axios.get(`/api/product/${productToEditId}`);
        if (data.success) {
            const prod = data.product;
            setName(prod.name || '');
            setDescription((prod.description || []).join('\n'));
            setCategory(prod.category || '');
            setPrice(prod.price || '');
            setOfferPrice(prod.offerPrice || '');
            setQuantity(prod.quantity || '');
            setFiles(prod.image || []);
        } else {
            toast.error(data.message);
        }
        } catch (err) {
        toast.error(err.response?.data?.message || err.message);
        }
    };

    fetchProduct();
    }, [productToEditId]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const productData = {
        name,
        description: description.split('\n'),
        category,
        price,
        offerPrice,
        quantity: parseInt(quantity) || 0
      };

      // If editing, include _id
      if (productToEditId) productData._id = productToEditId;

      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));

      // Only append new files (File objects)
      files.forEach(f => {
        if (f instanceof File) formData.append('images', f);
      });

      const url = productToEditId ? '/api/product/update' : '/api/product/add';
      const { data } = await axios.post(url, formData);

      if (data.success) {
        toast.success(
          productToEditId ? "Product updated successfully" : "Product added successfully"
        );
        await fetchProducts();
        navigate("/seller/product-list", { replace: true });
      } else {
        toast.error(data.message || "Something went wrong while saving the product");
      }

    } catch (error) {
      // Backend (Express) sends error JSON like: { success: false, message: "Product already exists" }
      const backendMessage = error.response?.data?.message;

      if (backendMessage) {
        toast.error(backendMessage);
      } else {
        // fallback if backend didn't send proper message
        toast.error("Something went wrong while adding product.");
      }

      console.error("Add Product Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="no-scollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg"> 
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4).fill('').map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  onChange={(e) => {
                    const updatedFile = [...files];
                    updatedFile[index] = e.target.files[0];
                    setFiles(updatedFile);
                  }}
                  accept="image/*" type="file" id={`image${index}`} hidden
                />
                <img
                  className="max-w-24 cursor-pointer"
                  src={files[index] ? (files[index] instanceof File ? URL.createObjectURL(files[index]) : files[index]) : assets.upload_area }
                  alt="uploadArea"
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
          <input onChange={(e)=> setName(e.target.value)} value={name}
            id="product-name" type="text" placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required
          />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
          <textarea onChange={(e)=> setDescription(e.target.value)} value={description}
            id="product-description" rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
          />
        </div>
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">Category</label>
          <select onChange={(e)=> setCategory(e.target.value)} value={category}
            id="category" className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40">
            <option value="">Select Category</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>{item.path}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex flex-col gap-1 w-full md:w-32">
          <label className="text-base font-medium" htmlFor="product-quantity">Quantity</label>
          <input
            onChange={(e)=> setQuantity(e.target.value)}
            value={quantity}
            id="product-quantity"
            type="number"
            placeholder="0"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 w-full"
            required
          />
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
            <input onChange={(e)=> setPrice(e.target.value)} value={price}
              id="product-price" type="number" placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
            <input onChange={(e)=> setOfferPrice(e.target.value)} value={offerPrice}
              id="offer-price" type="number" placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required
            />
          </div>
        </div>
        <button className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer">
          {productToEditId ? 'UPDATE' : 'ADD'}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
