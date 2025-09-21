import express from 'express';
import dotenv from 'dotenv';
import {cloudinaryConnect} from './config/cloudinary.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import dealerRoutes from './routes/dealer.routes.js';
import adminRoutes from './routes/admin.routes.js';
import storeRoutes from './routes/store.routes.js';
import productRoutes from './routes/product.routes.js';
import sparePartRoutes from './routes/sparePart.routes.js';
import orderRoutes from './routes/order.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import blogRoutes from './routes/blog.routes.js';

const app = express();
// if behind a proxy (Vercel, Heroku), trust first proxy so secure cookies work
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// add cors and cors options
const corsOptions = {
  origin: ['http://localhost:5173','http://localhost:5174','https://auto-hub-stjr.vercel.app'],
  credentials: true,
};
app.use(cookieParser());
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
cloudinaryConnect();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/store',storeRoutes);
app.use('/api/product',productRoutes);
app.use('/api/spareparts', sparePartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/blogs', blogRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app for Vercel serverless functions
export default app;
