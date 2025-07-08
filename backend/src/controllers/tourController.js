const { db } = require("../config/firebase");

// BUG: Error handling is incomplete - needs improvement for the test
// const getTours = async (req, res) => {
//   try {
//     const { location, minPrice, maxPrice } = req.query;

//     // Check if using JSON Server mode
//     if (process.env.USE_JSON_SERVER === 'true') {
//       // In JSON Server mode, proxy to JSON Server
//       const fetch = require('node-fetch');
//       const response = await fetch('http://localhost:3002/tours');
//       const tours = await response.json();

//       let filteredTours = tours;

//       // Apply filters if provided
//       if (location) {
//         filteredTours = filteredTours.filter(tour => tour.location === location);
//       }

//       if (minPrice) {
//         filteredTours = filteredTours.filter(tour => tour.price >= parseInt(minPrice));
//       }
//       if (maxPrice) {
//         filteredTours = filteredTours.filter(tour => tour.price <= parseInt(maxPrice));
//       }

//       return res.json(filteredTours);
//     }

//     // Firebase mode
//     let query = db.collection('tours');

//     // BUG: Query optimization needed for Firebase
//     if (location) {
//       query = query.where('location', '==', location);
//     }

//     const snapshot = await query.get();
//     const tours = [];

//     snapshot.forEach(doc => {
//       const tourData = doc.data();

//       if (minPrice && tourData.price < parseInt(minPrice)) {
//         return;
//       }
//       if (maxPrice && tourData.price > parseInt(maxPrice)) {
//         return;
//       }

//       tours.push({
//         id: doc.id,
//         ...tourData
//       });
//     });

//     // PERFORMANCE ISSUE: No caching implemented
//     res.json(tours);
//   } catch (error) {
//     console.error('Error fetching tours:', error);
//     res.status(500).json({ error: 'Failed to fetch tours' });
//   }
// };

const NodeCache = require("node-cache");

// In-memory cache: keys expire after 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

/**
 * Parse & validate integer query params.
 * Rejects non-digits (words, floats, negatives).
 */
function parseIntQueryParam(value, paramName, errors) {
  if (value == null) return undefined;
  if (typeof value !== "string" || !/^[0-9]+$/.test(value)) {
    errors.push(
      `\`${paramName}\` must be a non-negative integer, got “${value}”`
    );
    return undefined;
  }
  return Number(value);
}
// Helper validator
function parseIntParam(val, name, errors) {
  if (val == null) return undefined;
  if (typeof val !== "string" || !/^[0-9]+$/.test(val)) {
    errors.push(`${name} must be a non-negative integer.`);
    return undefined;
  }
  return parseInt(val, 10);
}
/**
 * Fetch with timeout using AbortController.
 */
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function getTours(req, res, next) {
  // 1) Validate & sanitize inputs
  const { location, minPrice: minQ, maxPrice: maxQ } = req.query;
  const validationErrors = [];

  const minPrice = parseIntQueryParam(minQ, "minPrice", validationErrors);
  const maxPrice = parseIntQueryParam(maxQ, "maxPrice", validationErrors);

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    validationErrors.push("`minPrice` cannot be greater than `maxPrice`");
  }

  if (validationErrors.length) {
    return res.status(400).json({ errors: validationErrors });
  }

  // 2) Generate cache key and check
  const cacheKey = `tours:${location || "all"}:${minPrice ?? ""}:${
    maxPrice ?? ""
  }`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  try {
    let tours = [];

    // 3) JSON‑Server proxy mode
    if (process.env.USE_JSON_SERVER === "true") {
      const JSON_SERVER_URL = "http://localhost:3002/tours";
      let jsonRes;
      try {
        jsonRes = await fetchWithTimeout(JSON_SERVER_URL, {}, 5000);
      } catch (err) {
        if (err.name === "AbortError") {
          return res
            .status(502)
            .json({ error: "JSON‑server request timed out" });
        }
        return res.status(502).json({ error: "Unable to reach JSON‑server" });
      }
      if (!jsonRes.ok) {
        return res.status(502).json({
          error: `JSON‑server responded with status ${jsonRes.status}`,
        });
      }
      tours = await jsonRes.json();
      // in-memory filters for JSON‑Server
      if (location) {
        tours = tours.filter((t) => t.location === location);
      }
      if (minPrice != null) {
        tours = tours.filter((t) => t.price >= minPrice);
      }
      if (maxPrice != null) {
        tours = tours.filter((t) => t.price <= maxPrice);
      }
    } else {
      // 4) Firebase mode with optimized query
      if (!db || typeof db.collection !== "function") {
        throw new Error("Firestore is not configured");
      }
      let query = db.collection("tours");
      if (location) {
        query = query.where("location", "==", location);
      }
      if (minPrice != null) {
        query = query.where("price", ">=", minPrice);
      }
      if (maxPrice != null) {
        query = query.where("price", "<=", maxPrice);
      }

      const snapshot = await query.get();
      snapshot.forEach((doc) => {
        tours.push({ id: doc.id, ...doc.data() });
      });
    }

    // 5) Cache and return
    cache.set(cacheKey, tours);
    return res.status(200).json(tours);
  } catch (err) {
    console.error("[getTours] unexpected error:", err);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while fetching tours." });
  }
}

const getTourById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if using JSON Server mode
    if (process.env.USE_JSON_SERVER === "true") {
      const fetch = require("node-fetch");
      const response = await fetch(`http://localhost:3002/tours/${id}`);

      if (!response.ok) {
        return res.status(404).json({ error: "Tour not found" });
      }

      const tour = await response.json();
      return res.json(tour);
    }

    // Firebase mode
    const doc = await db.collection("tours").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Tour not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
};

// TODO: Implement search functionality for the test
const searchTours = async (req, res) => {
  // 1) Validate inputs
  const { location, minPrice: minQ, maxPrice: maxQ, name } = req.query;
  const errors = [];

  const minPrice = parseIntQueryParam(minQ, "minPrice", errors);
  const maxPrice = parseIntQueryParam(maxQ, "maxPrice", errors);
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    errors.push("`minPrice` cannot be greater than `maxPrice`");
  }

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  // 2) Check cache
  const cacheKey = `tours:${location || ""}:${minPrice || ""}:${
    maxPrice || ""
  }:${name || ""}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }
  try {
    let tours = [];

    // 3) JSON‑Server proxy mode
    if (process.env.USE_JSON_SERVER === "true") {
      const url = "http://localhost:3002/tours";
      let response;
      try {
        response = await fetchWithTimeout(url, {}, 5000);
      } catch (err) {
        const msg =
          err.name === "AbortError"
            ? "JSON‑Server request timed out"
            : "Unable to reach JSON‑Server";
        return res.status(502).json({ error: msg });
      }
      if (!response.ok) {
        return res
          .status(502)
          .json({ error: `JSON‑Server responded ${response.status}` });
      }
      tours = await response.json();

      // In-memory filtering
      if (name) {
        const term = name.toLowerCase();
        tours = tours.filter(
          (t) =>
            t.name.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term)
        );
      }
      if (location) {
        tours = tours.filter((t) => t.location === location);
      }
      if (minPrice != null) tours = tours.filter((t) => t.price >= minPrice);
      if (maxPrice != null) tours = tours.filter((t) => t.price <= maxPrice);
    } else {
      // 4) Firebase mode with optimized query
      if (!db || typeof db.collection !== "function") {
        throw new Error("Firestore not configured");
      }
      let query = db.collection("tours");
      if (location) {
        query = query.where("location", "==", location);
      }
      if (minPrice != null) {
        query = query.where("price", ">=", minPrice);
      }
      if (maxPrice != null) {
        query = query.where("price", "<=", maxPrice);
      }
      if (name) {
        // Firestore doesn’t support LIKE; you’d need a text index or 3rd‑party.
        // For now, fetch by name prefix:
        query = query
          .where("name", ">=", name)
          .where("name", "<=", name + "\uf8ff");
      }

      const snap = await query.get();
      snap.forEach((doc) => tours.push({ id: doc.id, ...doc.data() }));
    }

    // 5) Cache & respond
    cache.set(cacheKey, tours);
    return res.status(200).json(tours);
  } catch (err) {
    console.error("[/api/tours] error:", err);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while fetching tours." });
  }
};

module.exports = {
  getTours,
  getTourById,
  searchTours,
};
