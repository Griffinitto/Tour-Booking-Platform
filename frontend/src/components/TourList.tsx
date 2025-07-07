import React, { useState, useEffect } from 'react';
import { getTours } from '../services/api';
import TourCard from './TourCard';
import { Tour } from '../types';

interface TourListProps {
  user: any;
}

const TourList: React.FC<TourListProps> = ({ user }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');

  // Build query params for API
  const buildQueryParams = () => {
    const params: Record<string, string> = {};
    if (searchTerm) params.name = searchTerm;
    if (locationFilter !== 'All') params.location = locationFilter;
    if (priceFilter === 'under-100') {
      params.maxPrice = '100';
    } else if (priceFilter === '100-500') {
      params.minPrice = '100';
      params.maxPrice = '500';
    } else if (priceFilter === 'over-500') {
      params.minPrice = '500';
    }
    return params;
  };

  // Fetch tours whenever filters change or user changes
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = buildQueryParams();
        const data = await getTours(params);
        setTours(data);
      } catch (err) {
        setError('Failed to load tours');
        console.error('Error fetching tours:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [user, searchTerm, locationFilter, priceFilter]);

  // Extract unique locations
  const locations = Array.from(new Set(tours.map(t => t.location)));
  const priceRanges = [
    { label: 'Under $100', value: 'under-100' },
    { label: '$100 - $500', value: '100-500' },
    { label: 'Over $500', value: 'over-500' },
  ];

  return (
    <div className="tour-list">
      <h2>Available Tours</h2>

      {/* Search & Filters always visible */}
      <div className="filters flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by tour name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="filter-input p-2 border rounded"
        />

        <select
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          className="filter-select p-2 border rounded"
        >
          <option value="All">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={priceFilter}
          onChange={e => setPriceFilter(e.target.value)}
          className="filter-select p-2 border rounded"
        >
          <option value="All">All Prices</option>
          {priceRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>

      {/* Results section */}
      <div className="results">
        {loading ? (
          <div className="loading">Loading tours...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : tours.length === 0 ? (
          <div className="empty-state text-gray-600">No tours match your criteria.</div>
        ) : (
          <div className="tours-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourList;
