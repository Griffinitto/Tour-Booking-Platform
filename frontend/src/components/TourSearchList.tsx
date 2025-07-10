import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react';

export interface FilterValues {
  name: string;
  location: string;
  priceRange: string;
  minRating: string;
  duration: string;
}

interface Props {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

const LOCATION_OPTIONS = [
  'All Locations',
  'New York',
  'London',
  'Paris',
  'Tokyo',
  'Rome',
  'Sydney',
];

const PRICE_RANGES = [
  { label: 'Any Price', value: '' },
  { label: '$0 - $100', value: '0-100' },
  { label: '$100 - $200', value: '100-200' },
  { label: '$200 - $300', value: '200-300' },
  { label: '$300+', value: '300-' },
];

const defaultFilters: FilterValues = {
  name: '',
  location: '',
  priceRange: '',
  minRating: '',
  duration: '',
};

const SearchFilters: React.FC<Props> = React.memo(({ filters, onChange }) => {
  const [local, setLocal] = useState<FilterValues>(filters);

  // Keep local state in sync if parent filters change (e.g. reset externally)
  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocal(prev => ({ ...prev, [name]: value }));
  };

  const apply = (e: FormEvent) => {
    e.preventDefault();
    onChange(local);
  };

  const clear = () => {
    setLocal(defaultFilters);
    onChange(defaultFilters);
  };

  return (
    <form onSubmit={apply} className="p-6 bg-white shadow-lg rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="col-span-full">
        <input
          name="name"
          placeholder="Search name or description"
          value={local.name}
          onChange={handleInput}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <select
          id="location"
          name="location"
          value={local.location}
          onChange={handleInput}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {LOCATION_OPTIONS.map(loc => (
            <option key={loc} value={loc === 'All Locations' ? '' : loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
          Price Range
        </label>
        <select
          id="priceRange"
          name="priceRange"
          value={local.priceRange}
          onChange={handleInput}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {PRICE_RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
          Min Rating
        </label>
        <input
          type="number"
          name="minRating"
          id="minRating"
          placeholder="e.g. 4"
          value={local.minRating}
          onChange={handleInput}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (days)
        </label>
        <input
          type="number"
          name="duration"
          id="duration"
          placeholder="e.g. 7"
          value={local.duration}
          onChange={handleInput}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="col-span-full flex justify-end space-x-2">
        <button
          type="button"
          onClick={clear}
          className="mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear Filters
        </button>
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
});

export default SearchFilters;
