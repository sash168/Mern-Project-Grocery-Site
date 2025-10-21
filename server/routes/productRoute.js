import express from 'express';
import { addProduct, changeStock, deleteProduct, productById, productList, updateProduct } from '../controllers/productController.js';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - offerPrice
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: array
 *           items:
 *             type: string
 *           description: Product descriptions
 *         price:
 *           type: number
 *           description: Original price
 *         offerPrice:
 *           type: number
 *           description: Discounted price
 *         image:
 *           type: array
 *           items:
 *             type: string
 *           description: Product images
 *         category:
 *           type: string
 *           description: Product category
 *         quantity:
 *           type: number
 *           description: Available quantity
 *         inStock:
 *           type: boolean
 *           description: Stock availability
 */

const productRouter = express.Router();

/**
 * @swagger
 * /api/product/list:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
productRouter.get('/list', productList);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
productRouter.get('/:id', productById);

/**
 * @swagger
 * /api/product/add:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - offerPrice
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fresh Apples
 *               description:
 *                 type: string
 *                 example: Fresh red apples
 *               price:
 *                 type: number
 *                 example: 100
 *               offerPrice:
 *                 type: number
 *                 example: 80
 *               category:
 *                 type: string
 *                 example: Fruits
 *               quantity:
 *                 type: number
 *                 example: 50
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images
 *     responses:
 *       200:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product added successfully
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);


export default productRouter;

