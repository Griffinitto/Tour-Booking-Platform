import React from "react";

const TourCardLoading: React.FC = () => (
	<div className="tour-card">
		{/* PERFORMANCE ISSUE: Images load without optimization - this is intentional for the test */}
		<span className="tour-image-loading loading-animation" />
		<div className="tour-info">
			<span className="tour-info-heading-loading loading-animation" />
			<span className="tour-info-paragraph-loading loading-animation" />
		</div>
	</div>
);

export default TourCardLoading;
