const { db } = require('../config/firebase');

// BUG: Error handling is incomplete - needs improvement for the test
/**
 * GET /tours
 * Fetches tours from either a local JSON Server or Firebase Firestore,
 * optionally filtering by location, minPrice, and maxPrice.
 */
const express = require('express');
const fetch = require('node-fetch');


// Shared helper: validate and parse numeric filters
function parsePriceFilters(query) {
  const errors = [];
  let minPriceNum, maxPriceNum;

  if (query.minPrice !== undefined) {
    minPriceNum = Number(query.minPrice);
    if (Number.isNaN(minPriceNum) || minPriceNum < 0) {
      errors.push("`minPrice` must be a non-negative number or not provided");
    }
  }
  if (query.maxPrice !== undefined) {
    maxPriceNum = Number(query.maxPrice);
    if (Number.isNaN(maxPriceNum) || maxPriceNum < 0) {
      errors.push("`maxPrice` must be a non-negative number");
    }
  }
  if (
    minPriceNum !== undefined &&
    maxPriceNum !== undefined &&
    minPriceNum > maxPriceNum
  ) {
    errors.push("`minPrice` cannot be greater than `maxPrice`");
  }

  return { errors, minPriceNum, maxPriceNum };
}

// Shared filter function
function applyPriceFilter(tour, minPriceNum, maxPriceNum) {
  if (minPriceNum !== undefined && tour.price < minPriceNum) return false;
  if (maxPriceNum !== undefined && tour.price > maxPriceNum) return false;
  return true;
}

// GET /api/tours
const getTours = async (req, res) => {
  try {
    const { location } = req.query;
    const { errors, minPriceNum, maxPriceNum } = parsePriceFilters(req.query);

    if (errors.length) {
      return res.status(400).json({ errors });
    }

    // JSON Server mode
    if (process.env.USE_JSON_SERVER === 'true') {
      const response = await fetch('http://localhost:3002/tours');
      if (!response.ok) {
        return res
          .status(502)
          .json({ error: 'Failed to fetch tours from JSON Server' });
      }
      let tours = await response.json();
      if (location) {
        tours = tours.filter(t => t.location === location);
      }
      tours = tours.filter(t => applyPriceFilter(t, minPriceNum, maxPriceNum));
      return res.json(tours);
    }

    // Firestore mode
    let query = db.collection('tours');
    if (location) {
      query = query.where('location', '==', location);
    }
    const snapshot = await query.get();
    const tours = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (applyPriceFilter(data, minPriceNum, maxPriceNum)) {
        tours.push({ id: doc.id, ...data });
      }
    });

    return res.json(tours);
  } catch (err) {
    console.error('Error in getTours:', err);
    return res
      .status(500)
      .json({ error: 'An unexpected error occurred while fetching tours' });
  }
};

// GET /api/tours/search
const searchTours = async (req, res) => {
  try {
    const { name, location } = req.query;
    const { errors, minPriceNum, maxPriceNum } = parsePriceFilters(req.query);

    // Validate `name` if provided
    if (name !== undefined && typeof name !== 'string') {
      errors.push('`name` must be a string');
    }

    if (errors.length) {
      return res.status(400).json({ errors });
    }

    // JSON Server mode
    if (process.env.USE_JSON_SERVER === 'true') {
      const response = await fetch('http://localhost:3002/tours');
      if (!response.ok) {
        return res
          .status(502)
          .json({ error: 'Failed to fetch tours from JSON Server' });
      }
      let tours = await response.json();

      // Apply filters
      if (name) {
        const lowerName = name.toLowerCase();
        tours = tours.filter(t =>
          t.name.toLowerCase().includes(lowerName)
        );
      }
      if (location) {
        tours = tours.filter(t => t.location === location);
      }
      tours = tours.filter(t => applyPriceFilter(t, minPriceNum, maxPriceNum));

      return res.json(tours);
    }

    // Firestore mode
    let query = db.collection('tours');
    if (location) {
      query = query.where('location', '==', location);
    }
    const snapshot = await query.get();
    let tours = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      tours.push({ id: doc.id, ...data });
    });

    // Apply in-memory filters for name & price
    if (name) {
      const lowerName = name.toLowerCase();
      tours = tours.filter(t =>
        t.name.toLowerCase().includes(lowerName)
      );
    }
    tours = tours.filter(t => applyPriceFilter(t, minPriceNum, maxPriceNum));

    return res.json(tours);
  } catch (err) {
    console.error('Error in searchTours:', err);
    return res
      .status(500)
      .json({ error: 'An unexpected error occurred during tour search' });
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


module.exports = {
  getTours,
  getTourById,
  searchTours
};