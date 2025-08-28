import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import dealerRoutes from './routes/dealer.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

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
