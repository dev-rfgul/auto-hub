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

const app = express();
const PORT = process.env.PORT || 3000;

// add cors and cors options
const corsOptions = {
  origin: ['http://localhost:5173','http://localhost:5174'],
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
