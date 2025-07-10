// components/TourContainer.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTours } from '../services/api';
import { Tour } from '../types';
import SearchFilters, { FilterValues } from '../components/TourSearchList';
import TourList from '../components/TourList';

const Tours: React.FC = () => {
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [filters, setFilters] = useState<FilterValues>({
    // name: '',
    // location: '',
    // // minPrice: '',
    // // maxPrice: '',
    // minRating: '',
    // duration: '',
    name: '',
    location: '',
    priceRange: '',
    minRating: '',
    duration: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch once on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getTours();
        if (isMounted) setAllTours(data);
      } catch (err) {
        console.error(err);
        if (isMounted) setError('Failed to load tours');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // memoized filtered list
 const filteredTours = useMemo(
  () =>
    allTours.filter((t) => {
      const { name, location, priceRange, minRating, duration } = filters;
      const term = name.toLowerCase();

      // text search
      if (
        term &&
        !t.name.toLowerCase().includes(term) &&
        !t.description.toLowerCase().includes(term)
      ) {
        return false;
      }

      // location dropdown
      if (location && !t.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // parse priceRange (e.g. "50-100", "200-")
      let mp: number | undefined;
      let xp: number | undefined;
      if (priceRange) {
        const [minStr, maxStr] = priceRange.split('-');
        if (minStr) mp = Number(minStr);
        if (maxStr) xp = Number(maxStr);
      }

      // numeric filters
      const mr = minRating ? Number(minRating) : undefined;
      const dr = duration ? Number(duration) : undefined;

      if (mp != null && t.price < mp) return false;
      if (xp != null && t.price > xp) return false;
      if (mr != null && t.rating < mr) return false;
      if (dr != null && t.duration !== dr) return false;

      return true;
    }),
  [allTours, filters]
);


  const onFiltersChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  if (loading) return <div className="loading">Loading tours…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <SearchFilters filters={filters} onChange={onFiltersChange} />
      <TourList tours={filteredTours} />
    </>
  );
};

export default Tours;
