// server/routes/carRoutes.js
import express from 'express';
import { createCar, getCars, getCarById, updateCar, deleteCar } from '../controllers/carController.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/', auth, upload.array('images', 10), createCar); // Allow up to 10 images
router.get('/', auth, getCars);
router.get('/:id', auth, getCarById);
router.put('/:id', auth, upload.array('images', 10), updateCar); // Allow up to 10 images for update
router.delete('/:id', auth, deleteCar);

export default router;
