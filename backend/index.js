import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import dealerRoutes from './routes/dealer.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// add cors and cors options
const corsOptions = {
  origin: ['http://localhost:5173','http://localhost:5174'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api/admin', adminRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
