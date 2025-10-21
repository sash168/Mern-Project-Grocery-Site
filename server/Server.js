import cookieParser from 'cookie-parser';
import express, { application } from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import ordreRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

//Allow multiple origin
const allowedOrigins = [
  'http://localhost:5173', 
  'http://192.168.1.36:5173', // Your local network IP
  'http://0.0.0.0:5173',
  'https://sasha-grocery-site.vercel.app', 
  'https://sasha-grocery-site-git-main-sashmita-mahapatros-projects.vercel.app', 
  'https://sasha-grocery-site-q6b0l3peq-sashmita-mahapatros-projects.vercel.app'
];

app.post('/stripe', express.raw({type:'application/json'}), stripeWebhooks)

//Middleware Configs
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));

app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter); 
app.use('/api/order', ordreRouter);


app.listen(port, '0.0.0.0', ()=>{
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Local access: http://localhost:${port}`);
    console.log(`Network access: http://192.168.1.36:${port}`);
})
