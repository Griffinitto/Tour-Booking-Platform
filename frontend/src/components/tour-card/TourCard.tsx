import React from "react";
import { Tour } from "../../types";

interface TourCardProps {
	tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
	return (
		<div className="tour-card">
			{/* PERFORMANCE ISSUE: Images load without optimization - this is intentional for the test */}
			<img src={tour.image} alt={tour.name} className="tour-image" />
			<div className="tour-info">
				<h3>{tour.name}</h3>
				<p className="tour-location">{tour.location}</p>
				<p className="tour-description">{tour.description}</p>
				<div className="tour-details">
					<span className="tour-price">${tour.price}</span>
					<span className="tour-duration">{tour.duration} days</span>
				</div>
			</div>
		</div>
	);
};

export default TourCard;
