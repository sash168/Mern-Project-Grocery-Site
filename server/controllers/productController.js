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
        const { id } = req.body;
        const product = await Product.findById(id);

        return res.json({
            success:true, product
        })
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while getting individual products"+ e.message});
    }
}

//change product stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;
        await Product.findByIdAndUpdate(id, {inStock})
        
        return res.json({
            success:true, message: "Stock Updated"
        })
    } catch (e) {
        console.log(e.message);
        res.json({ success: false, message: "Error occured while updating Stock"+ e.message});
    }
}