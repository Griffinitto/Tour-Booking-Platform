import React, { useState } from "react";
import FilterTours from "../components/FilterTours";
import TourList from "../components/TourList";
import { SearchFilters, User } from "../types";

interface ToursProps {
	user: User | null;
}

const Tours: React.FC<ToursProps> = ({ user }) => {
	const [filters, setFilters] = useState<SearchFilters>({
		name: undefined,
		location: undefined,
		maxPrice: undefined,
		minPrice: undefined,
	});

	return (
		<div className="page-container">
			<h1 className="page-title">Available Tours</h1>
			{/* TODO: Add search and filter functionality here */}
			<FilterTours setFilters={setFilters} />
			<TourList user={user} filters={filters} />
		</div>
	);
};

export default Tours;
