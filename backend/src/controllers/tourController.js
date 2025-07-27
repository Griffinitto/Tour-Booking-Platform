const { messaging } = require("firebase-admin");
const { db } = require("../config/firebase");

// BUG: Error handling is incomplete - needs improvement for the test
const getTours = async (req, res) => {
	try {
		const { location, minPrice, maxPrice } = req.query;

		if (minPrice && (isNaN(minPrice) || +minPrice < 0))
			return res.status(400).json({
				error: "Invalid input",
				message: "minimum price is not valid.",
			});

		if (maxPrice && (isNaN(maxPrice) || +maxPrice < 0))
			return res.status(400).json({
				error: "Invalid input",
				message: "maximum price is not valid.",
			});

		if (maxPrice && minPrice && +minPrice > +maxPrice)
			return res.status(400).json({
				error: "Invalid input",
				message: "maximum price must be greater than minimum price.",
			});

		// Check if using JSON Server mode
		if (process.env.USE_JSON_SERVER === "true") {
			try {
				// In JSON Server mode, proxy to JSON Server
				const fetch = require("node-fetch");
				const response = await fetch("http://localhost:3002/tours");
				const tours = await response.json();

				let filteredTours = tours;

				// Apply filters if provided
				if (location) {
					filteredTours = filteredTours.filter(
						(tour) => tour.location === location,
					);
				}

				if (minPrice) {
					filteredTours = filteredTours.filter(
						(tour) => tour.price >= parseInt(minPrice),
					);
				}
				if (maxPrice) {
					filteredTours = filteredTours.filter(
						(tour) => tour.price <= parseInt(maxPrice),
					);
				}

				return res.status(200).json(filteredTours);
			} catch (error) {
				console.error("An error happened in getTours:", error);

				return res.status(502).json({
					error: "Failed to get data from server",
					message: `Error Details: ${error.message}`,
				});
			}
		}

		// Firebase mode
		let query = db.collection("tours");

		// BUG: Query optimization needed for Firebase
		if (location) {
			query = query.where("location", "==", location);
		}

		const snapshot = await query.get();
		const tours = [];

		snapshot.forEach((doc) => {
			const tourData = doc.data();

			if (minPrice && tourData.price < parseInt(minPrice)) {
				return;
			}
			if (maxPrice && tourData.price > parseInt(maxPrice)) {
				return;
			}

			tours.push({
				id: doc.id,
				...tourData,
			});
		});

		// PERFORMANCE ISSUE: No caching implemented
		res.json(tours);
	} catch (error) {
		console.error("Error fetching tours:", error);
		res.status(500).json({ error: "Failed to fetch tours" });
	}
};

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
	try {
		const { name, location, minPrice, maxPrice } = req.query;

		if (name && typeof name !== "string")
			return res.status(400).json({
				error: "Invalid Input",
				message: "Search is not valid",
			});

		if (location && typeof location !== "string")
			return res.status(400).json({
				error: "Invalid Input",
				message: "Location is not valid",
			});

		if (minPrice && (isNaN(minPrice) || +minPrice < 0))
			return res.status(400).json({
				error: "Invalid input",
				message: "minimum price is not valid.",
			});

		if (maxPrice && (isNaN(maxPrice) || +maxPrice < 0))
			return res.status(400).json({
				error: "Invalid input",
				message: "maximum price is not valid.",
			});

		if (maxPrice && minPrice && +minPrice > +maxPrice)
			return res.status(400).json({
				error: "Invalid input",
				message: "maximum price must be greater than minimum price.",
			});

		if (process.env.USE_JSON_SERVER === "true") {
			try {
				// In JSON Server mode, proxy to JSON Server
				const fetch = require("node-fetch");
				const response = await fetch("http://localhost:3002/tours");
				const tours = await response.json();

				let filteredTours = tours;

				// Apply filters if provided
				if (name) {
					filteredTours = filteredTours.filter((tour) =>
						tour.name.toLowerCase().includes(name.toLowerCase()),
					);
				}

				if (location) {
					filteredTours = filteredTours.filter(
						(tour) => tour.location === location,
					);
				}

				if (minPrice) {
					filteredTours = filteredTours.filter(
						(tour) => tour.price >= parseInt(minPrice),
					);
				}
				if (maxPrice) {
					filteredTours = filteredTours.filter(
						(tour) => tour.price <= parseInt(maxPrice),
					);
				}

				return res.status(200).json(filteredTours);
			} catch (error) {
				throw new Error(error);
			}
		}
	} catch (error) {
		console.error("An error happened in searchTours: ", error);

		return res.status(502).json({
			error: "Failed to get data from server",
			message: `Error Details: ${error.message}`,
		});
	}
};

module.exports = {
	getTours,
	getTourById,
	searchTours,
};
