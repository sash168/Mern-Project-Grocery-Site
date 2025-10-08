import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

//add product
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);

        const images = req.files;

        let imagesUrl = await Promise.all(
            images.map(async(item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' })
                return result.secure_url
            })
        )

        await Product.create({
            ...productData, image: imagesUrl
        })

        res.json({success: true, message: "Product Added"})
    }
    catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while adding product "+ e.message});
    }
}

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


