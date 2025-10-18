import express from 'express';
import https from 'https';
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

// ...existing code...
const app = express();

// Ensure certs are read relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = '192.168.0.106' || '0.0.0.0'; // use 0.0.0.0 for testing; keep your static IP in env if needed
const CERT_KEY = process.env.CERT_KEY || path.join(__dirname, '192.168.0.106+2-key.pem');
const CERT_PEM = process.env.CERT_PEM || path.join(__dirname, '192.168.0.106+2.pem');
// ...existing code...
let privateKey = fs.readFileSync(CERT_KEY, 'utf8');
let certificate = fs.readFileSync(CERT_PEM, 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Connect databases and services
await connectDB();
await connectCloudinary();

// Set allowed CORS origins
const allowedOrigins = [
  'https://192.168.0.106:4000',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost:5173',
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
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};
app.use(cors(corsOptions));
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

// Global error handler should be last
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Allow override for easier testing; set HOST=0.0.0.0 to accept all interfaces
https.createServer(credentials, app).listen(4000, HOST, () => {
  console.log(`HTTPS server running on ${HOST}:4000`);
});
// ...existing code...