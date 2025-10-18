import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const { name, category } = productData;

    const existingProduct = await Product.findOne({ name, category });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `Product "${name}" in category "${category}" already exists.`,
      });
    }

    const images = req.files || [];
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imagesUrl });

    return res.status(200).json({
      success: true,
      message: "Product added successfully.",
    });

  } catch (e) {
    console.log("❌ Error adding product:", e);

    // Handle duplicate key error (Mongo unique index)
    if (e.code === 11000) {
      const keys = Object.keys(e.keyPattern || {});
      return res.status(400).json({
        success: false,
        message: `Duplicate entry for ${keys.join(", ")} — product already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error: " + e.message,
    });
  }
};



//get product list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.json({
            success:true, products
        })
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while getting all products"+ e.message});
    }
}

//get individual product
export const productById = async (req, res) => {
    try {
        const { id } = req.params; // read from URL params
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.json({ success: true, product });
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ success: false, message: "Error occurred while getting individual product: " + e.message });
    }
};

//change product stock
// export const changeStock = async (req, res) => {
//     try {
//         const { id, inStock } = req.body;
//         await Product.findByIdAndUpdate(id, {inStock})
        
//         return res.json({
//             success:true, message: "Stock Updated"
//         })
//     } catch (e) {
//         console.log(e.message);
//         res.json({ success: false, message: "Error occured while updating Stock"+ e.message});
//     }
// }

export const changeStock = async (req, res) => {
  try {
    const { id, inStock, quantity } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        inStock: quantity > 0 ? inStock : false,
        quantity
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Stock Updated",
      product: updatedProduct
    });
  } catch (e) {
    console.log(e.message);
    res.json({ success: false, message: "Error updating stock: " + e.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const { _id, quantity } = productData;

    let imagesUrl = [];
    if (req.files && req.files.length > 0) {
      imagesUrl = await Promise.all(
        req.files.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
          return result.secure_url;
        })
      );
    }

    const update = {
      ...productData,
      ...(imagesUrl.length > 0 && { image: imagesUrl }),
      inStock: quantity > 0 ? true : false
    };

    const updatedProduct = await Product.findByIdAndUpdate(_id, update, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (e) {
    console.log(e.message);
    res.status(500).json({ success: false, message: "Error updating product: " + e.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({
      success: true,
      message: `Product "${deletedProduct.name}" deleted successfully.`,
    });
  } catch (e) {
    console.log("Error deleting product:", e);
    return res.status(500).json({ success: false, message: "Server error: " + e.message });
  }
};

