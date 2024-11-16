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
app.use(express.json());


const allowedOrigins = [
  'http://localhost:5173', // For local development
  'https://car-management-app-ten.vercel.app', // Your Vercel frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  credentials: true, // If you're using cookies
}));
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

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
