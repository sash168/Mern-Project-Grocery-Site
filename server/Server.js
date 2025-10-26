import express from 'express';
import fs from 'fs';
import cookieParser from 'cookie-parser';
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
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { specs, swaggerUi } from './configs/swagger.js';
import printRoutes from './routes/printRoutes.js';

// ...existing code...
const app = express();
const port = process.env.PORT || 4000;

// Ensure certs are read relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = '0.0.0.0'; // use 0.0.0.0 for testing; keep your static IP in env if needed
const CERT_KEY = process.env.CERT_KEY || path.join(__dirname, '192.168.0.106+2-key.pem');
const CERT_PEM = process.env.CERT_PEM || path.join(__dirname, '192.168.0.106+2.pem');
// ...existing code...
let privateKey = fs.readFileSync(CERT_KEY, 'utf8');
let certificate = fs.readFileSync(CERT_PEM, 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Connect databases and services
await connectDB();
await connectCloudinary();

//Allow multiple origin
const allowedOrigins = [
  'http://localhost:5173', 
  'http://192.168.0.104:5173',
  'http://0.0.0.0:5173',
  'http://192.168.0.104:4000',
  'https://sasha-grocery-site.vercel.app', 
  'https://sasha-grocery-site-git-main-sashmita-mahapatros-projects.vercel.app', 
  'https://sasha-grocery-site-q6b0l3peq-sashmita-mahapatros-projects.vercel.app'
];

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middleware
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS check:", origin); // debug incoming origin
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};
app.use(cors(corsOptions));
// app.use(cors());
app.use(morgan('combined'));

// Debug logger to inspect incoming origin/host
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url, 'Origin:', req.headers.origin, 'Host:', req.headers.host);
  next();
});

// Routes
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', ordreRouter);
app.use('/api/print', printRoutes);

app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(specs,{
    explorer: true,
    customCss: '.swagger-ui .topbar {display: none }',
    customSiteTitle: 'Grocery Store API',
}));

app.get('/docs', (req, res) => res.redirect('/api-docs'));

app.listen(port, '0.0.0.0', ()=>{
    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Local access: http://localhost:${port}`);
})
