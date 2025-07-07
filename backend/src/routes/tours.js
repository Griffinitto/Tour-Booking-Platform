const express = require('express');
const router = express.Router();
const { getTours, getTourById, searchTours } = require('../controllers/tourController');

// Get all tours with optional filtering
router.get('/', getTours);

// Search tours - this is where candidates will implement the search endpoint
router.get('/search', searchTours);

// Get specific tour by ID
router.get('/:id', getTourById);

module.exports = router;