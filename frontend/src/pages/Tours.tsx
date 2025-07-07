import React from 'react';
import TourList from '../components/TourList';
import { User } from '../types';

interface ToursProps {
  user: User | null;
}

const Tours: React.FC<ToursProps> = ({ user }) => {
  return (
    <div className="page-container">
      <h1 className="page-title">Available Tours</h1>
      {/* TODO: Add search and filter functionality here */}
      <TourList user={user} />
    </div>
  );
};

export default Tours;