import React, { useEffect, useState } from "react";
import { searchTours } from "../services/api";
import { Tour } from "../types";
import TourCard from "./tour-card/TourCard";
import TourCardLoading from "./tour-card/TourCardLoading";

interface TourListProps {
	user: any;
	filters: any;
}

// PERFORMANCE ISSUE: Component re-renders unnecessarily - this is intentional for the test
const TourList: React.FC<TourListProps> = ({ filters }) => {
	const [tours, setTours] = useState<Tour[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTours = async () => {
			try {
				setLoading(true);
				const data = await searchTours(filters);

				setTours(data);
			} catch (err) {
				setError("Failed to load tours");
				console.error("Error fetching tours:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchTours();
	}, [filters]); // BUG: Re-fetches on every user state change - this is intentional for the test

	if (error) return <div className="error">{error}</div>;

	return (
		<div className="tour-list">
			<h2>Available Tours</h2>
			<div className="tours-grid">
				{loading
					? [...new Array(9)].map((_, index) => <TourCardLoading key={index} />)
					: tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
			</div>
		</div>
	);
};

export default TourList;
