import Car from '../models/Car.js';
import fs from 'fs';
import path from 'path';

// Create a new car
export const createCar = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const userId = req.userId; // obtained from auth middleware
    const images = req.files ? req.files.map(file => file.path) : [];

    // Validate the number of images
    if (images.length > 10) {
      return res.status(400).json({ error: 'You can upload up to 10 images only.' });
    }

    const car = new Car({ title, description, tags, images, userId });
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a car by ID
export const updateCar = async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, existingImages } = req.body;
  const newImages = req.files ? req.files.map(file => file.filename) : [];

  try {
    // Find the car by ID
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Parse `existingImages` into an array (it might arrive as a string)
    const retainedImages = Array.isArray(existingImages)
    ? existingImages
    : JSON.parse(existingImages || '[]');
  
    // Identify old images to delete
    const imagesToDelete = car.images.filter(image => !retainedImages.includes(image));

    // Delete old images from the server
    imagesToDelete.forEach(image => {
      const imagePath = path.resolve('uploads', path.basename(image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the old image
      }
    });

    // Update car details
    car.title = title;
    car.description = description;
    car.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    car.images = [...retainedImages.map(img => path.basename(img)), ...newImages];

    await car.save(); // Save updated car details

    return res.json(car); // Return updated car details
  } catch (err) {
    console.error('Error updating car:', err);
    res.status(500).json({ error: 'Failed to update car details', details: err.message });
  }
  
};

// Get all cars for a user
export const getCars = async (req, res) => {
  const { search } = req.query; // Get search term from query parameters
  const userId = req.userId; // Get the user ID from the token

  try {
    // Construct search criteria if the search term is provided
    const searchCriteria = search
      ? {
          userId,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
          ],
        }
      : { userId }; // If no search term, just filter by userId

    const cars = await Car.find(searchCriteria); // Search cars based on the criteria
    res.status(200).json(cars); // Return the list of cars
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a car by ID
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car || car.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a car by ID
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.status(200).json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
