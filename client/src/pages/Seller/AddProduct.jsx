import React, { useState } from 'react';
import { assets, categories } from "../../assets/assets";
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

function AddProduct() {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState(''); 
  const [quantity, setQuantity] = useState('');

  const { axios } = useAppContext();

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      const productData = {
        name,
        description: description.split('\n'),
        category,
        price,
        offerPrice,
        quantity: parseInt(quantity)
      }

      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData))

      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const { data } = await axios.post('api/product/add', formData);

      if (data.success) {
        toast.success(data.message);
        setName('');
        setDescription('');
        setCategory('');
        setFiles([]);
        setPrice('');
        setOfferPrice('');
        setQuantity('');
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-start md:justify-between">
      <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-full md:max-w-lg mx-auto">
        
        {/* Product Images */}
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
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 cursor-pointer object-contain border border-gray-300 rounded"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt="uploadArea"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
          <input
            onChange={(e)=> setName(e.target.value)} value={name}
            id="product-name" type="text" placeholder="Type here"
            className="outline-none py-2.5 px-3 rounded border border-gray-500/40 w-full"
            required
          />
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-base font-medium" htmlFor="product-description">Product Description</label>
          <textarea
            onChange={(e)=> setDescription(e.target.value)} value={description}
            id="product-description" rows={4}
            className="outline-none py-2.5 px-3 rounded border border-gray-500/40 resize-none w-full"
            placeholder="Type here"
          ></textarea>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-base font-medium" htmlFor="category">Category</label>
          <select
            onChange={(e)=> setCategory(e.target.value)} value={category}
            id="category"
            className="outline-none py-2.5 px-3 rounded border border-gray-500/40 w-full"
          >
            <option value="">Select Category</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>{item.path}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1 w-full sm:w-32">
          <label className="text-base font-medium" htmlFor="product-quantity">Quantity</label>
          <input
            onChange={(e)=> setQuantity(e.target.value)} value={quantity}
            id="product-quantity" type="number" placeholder="0"
            className="outline-none py-2.5 px-3 rounded border border-gray-500/40 w-full"
            required
          />
        </div>

        {/* Price and Offer Price */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex flex-col gap-1 w-full sm:w-32">
            <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
            <input
              onChange={(e)=> setPrice(e.target.value)} value={price}
              id="product-price" type="number" placeholder="0"
              className="outline-none py-2.5 px-3 rounded border border-gray-500/40 w-full"
              required
            />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-32">
            <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
            <input
              onChange={(e)=> setOfferPrice(e.target.value)} value={offerPrice}
              id="offer-price" type="number" placeholder="0"
              className="outline-none py-2.5 px-3 rounded border border-gray-500/40 w-full"
              required
            />
          </div>
        </div>

        <button className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer w-full sm:w-auto">
          ADD
        </button>
      </form>
    </div>
  )
}

export default AddProduct;
