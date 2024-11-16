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
  'http://localhost:5173', // For local testing
  // Replace with the actual deployed URL when live
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowing necessary methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowing these headers
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

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
