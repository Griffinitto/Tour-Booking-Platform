import React, { useState, useEffect } from "react";
import { getLocations } from "../services/api";
import { SearchFilters } from "../types";

const PRICE_RANGE = ["All", "0-100", "101-200", "201-300", "301-400", "401+"];

interface FilterToursProps {
	setFilters: (newValue: SearchFilters) => void;
}

const FilterTours: React.FC<FilterToursProps> = ({ setFilters }) => {
	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [priceRange, setPriceRange] = useState("");
	const [locations, setLocations] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch locations dynamically
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				setLoading(true);
				const fetchedLocations = await getLocations();
				setLocations(["All", ...fetchedLocations]);
			} catch (err) {
				setError("Failed to load locations");
				console.error("Error fetching locations:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchLocations();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		let minPrice: number | undefined;
		let maxPrice: number | undefined;

		if (priceRange && priceRange !== "All") {
			if (priceRange === "401+") {
				minPrice = 401;
				maxPrice = undefined;
			} else {
				const [min, max] = priceRange.split("-").map(Number);
				minPrice = min;
				maxPrice = max;
			}
		}

		setFilters({
			name,
			location: location === "All" ? "" : location,
			minPrice,
			maxPrice,
		});
	};

	const handleReset = () => {
		setName("");
		setLocation("");
		setPriceRange("");
		setFilters({
			name: "",
			location: "",
			minPrice: undefined,
			maxPrice: undefined,
		});
	};

	if (loading) return <div className="loading">Loading filters...</div>;
	if (error) return <div className="error">{error}</div>;

	return (
		<form onSubmit={handleSubmit} className="filter-tours-form">
			<div>
				<input
					type="text"
					placeholder="Search by tour name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<select value={location} onChange={(e) => setLocation(e.target.value)}>
					<option value="">Select Location</option>
					{locations.map((loc) => (
						<option key={loc} value={loc}>
							{loc}
						</option>
					))}
				</select>
				<select
					value={priceRange}
					onChange={(e) => setPriceRange(e.target.value)}
				>
					<option value="">Select Price Range</option>
					{PRICE_RANGE.map((range) => (
						<option key={range} value={range}>
							{range}
						</option>
					))}
				</select>
			</div>
			<div>
				<button type="submit">Apply Filters</button>
				<button type="reset" onClick={handleReset}>
					Reset Filters
				</button>
			</div>
		</form>
	);
};

export default FilterTours;
