// server/app.js
import express from 'express';
import path from 'path';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
}));
app.use(express.json());
// Serve static files from the 'uploads' directory
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({ storage });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
