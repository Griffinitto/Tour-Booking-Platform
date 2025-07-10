import React from 'react';
import Spinner from './Spinner';

interface StatusDisplayProps {
  loading: boolean;
  count: number;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ loading, count }) => {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        {/* You can swap this for any spinner you like */}
        <Spinner />
      </div>
    );
  }

  if (!loading && count === 0) {
    return (
      <div className="text-center text-gray-500 my-8">
        No tours match your criteria.
      </div>
    );
  }

  return null;
};

export default StatusDisplay;
