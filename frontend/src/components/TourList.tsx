import React from 'react';
import TourCard from './TourCard';
import { Tour } from '../types';

interface Props {
  tours: Tour[];
}

const TourList: React.FC<Props> = ({ tours }) => {
  if (tours.length === 0) {
    return <p>No tours available.</p>;
  }

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

export default React.memo(TourList);
