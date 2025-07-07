const { db } = require('../config/firebase');

// BUG: Error handling is incomplete - needs improvement for the test
/**
 * GET /tours
 * Fetches tours from either a local JSON Server or Firebase Firestore,
 * optionally filtering by location, minPrice, and maxPrice.
 */
const getTours = async (req, res) => {
  try {
    const { location, minPrice, maxPrice } = req.query;

    // Validate numeric filters
    const errors = [];
    let minPriceNum, maxPriceNum;

    if (minPrice !== undefined) {
      minPriceNum = Number(minPrice);
      if (Number.isNaN(minPriceNum) || minPriceNum < 0) {
        errors.push("`minPrice` must be a non-negative number or not provided");
      }
    }
    if (maxPrice !== undefined) {
      maxPriceNum = Number(maxPrice);
      if (Number.isNaN(maxPriceNum) || maxPriceNum < 0) {
        errors.push("`maxPrice` must be a non-negative number");
      }
    }
    if (minPriceNum !== undefined && maxPriceNum !== undefined && minPriceNum > maxPriceNum) {
      errors.push("`minPrice` cannot be greater than `maxPrice`");
    }

    if (errors.length > 0) {
      // 400 Bad Request for client-side input errors
      return res.status(400).json({ errors });
    }

    // Helper to apply price filters on an array of tours
    const applyPriceFilter = tour => {
      if (minPriceNum !== undefined && tour.price < minPriceNum) return false;
      if (maxPriceNum !== undefined && tour.price > maxPriceNum) return false;
      return true;
    };

    // === JSON Server Mode ===
    if (process.env.USE_JSON_SERVER === 'true') {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:3002/tours');

      if (!response.ok) {
        // 502 Bad Gateway if JSON Server is unreachable or fails
        return res
          .status(502)
          .json({ error: "Failed to fetch tours from JSON Server" });
      }

      let tours = await response.json();

      // Apply optional filters
      if (location) {
        tours = tours.filter(t => t.location === location);
      }
      tours = tours.filter(applyPriceFilter);

      return res.json(tours);
    }

    // === Firebase Mode ===
    // Start building the Firestore query
    let query = db.collection('tours');
    if (location) {
      query = query.where('location', '==', location);
    }

    const snapshot = await query.get();
    const tours = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Apply price filtering in-memory
      if (applyPriceFilter(data)) {
        tours.push({ id: doc.id, ...data });
      }
    });

    // TODO: Integrate caching layer here (e.g., Redis or in-memory TTL cache)
    return res.json(tours);

  } catch (err) {
    console.error('Error in getTours:', err);
    // 500 Internal Server Error for unexpected failures
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while fetching tours" });
  }
};


const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if using JSON Server mode
    if (process.env.USE_JSON_SERVER === 'true') {
      const fetch = require('node-fetch');
      const response = await fetch(`http://localhost:3002/tours/${id}`);
      
      if (!response.ok) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      
      const tour = await response.json();
      return res.json(tour);
    }
    
    // Firebase mode
    const doc = await db.collection('tours').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Tour not found' });
    }
    
    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ error: 'Failed to fetch tour' });
  }
};

// TODO: Implement search functionality for the test
const searchTours = async (req, res) => {
  // This is where candidates will implement the search functionality
  res.status(501).json({ error: 'Search functionality not implemented yet' });
};

module.exports = {
  getTours,
  getTourById,
  searchTours
};