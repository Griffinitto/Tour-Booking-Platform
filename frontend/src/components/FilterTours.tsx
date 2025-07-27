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
		<form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg">
			<h2 className="text-xl font-semibold mb-4">Filter Tours</h2>
			<div className="flex flex-col md:flex-row gap-4 mb-4">
				<input
					type="text"
					placeholder="Search by tour name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="border rounded p-2 w-full md:w-1/3"
				/>
				<select
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					className="border rounded p-2 w-full md:w-1/3"
				>
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
					className="border rounded p-2 w-full md:w-1/3"
				>
					<option value="">Select Price Range</option>
					{PRICE_RANGE.map((range) => (
						<option key={range} value={range}>
							{range}
						</option>
					))}
				</select>
			</div>
			<div className="flex gap-4">
				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					Apply Filters
				</button>
				<button
					type="button"
					onClick={handleReset}
					className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
				>
					Reset Filters
				</button>
			</div>
		</form>
	);
};

export default FilterTours;
