import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRoutes);
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
