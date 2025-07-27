import React, { useState, useEffect } from "react";
import { getTours } from "../services/api";
import TourCard from "./TourCard";
import { Tour } from "../types";

interface TourListProps {
	user: any;
}

// PERFORMANCE ISSUE: Component re-renders unnecessarily - this is intentional for the test
const TourList: React.FC<TourListProps> = ({ user }) => {
	const [tours, setTours] = useState<Tour[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTours = async () => {
			try {
				setLoading(true);
				const data = await getTours();
				setTours(data);
			} catch (err) {
				setError("Failed to load tours");
				console.error("Error fetching tours:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchTours();
	}, []); // BUG: Re-fetches on every user state change - this is intentional for the test

	if (loading) return <div className="loading">Loading tours...</div>;
	if (error) return <div className="error">{error}</div>;

	return (
		<div className="tour-list">
			<h2>Available Tours</h2>
			<div className="tours-grid">
				{tours.map((tour) => (
					<TourCard key={tour.id} tour={tour} />
				))}
			</div>
		</div>
	);
};

export default TourList;
