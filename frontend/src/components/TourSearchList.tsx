import React, { ChangeEvent, FormEvent, useState } from 'react';

export interface FilterValues {
  name: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  duration: string;
}

interface Props {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

const SearchFilters: React.FC<Props> = React.memo(({ filters, onChange }) => {
  const [local, setLocal] = useState(filters);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocal((prev) => ({ ...prev, [name]: value }));
  };

  const apply = (e: FormEvent) => {
    e.preventDefault();
    onChange(local);
  };

  return (
    <form onSubmit={apply} className="search-filters">
      <input
        name="name"
        placeholder="Search name/desc"
        value={local.name}
        onChange={handleInput}
      />
      <input
        name="location"
        placeholder="Location"
        value={local.location}
        onChange={handleInput}
      />
      <input
        name="minPrice"
        placeholder="Min Price"
        value={local.minPrice}
        onChange={handleInput}
      />
      <input
        name="maxPrice"
        placeholder="Max Price"
        value={local.maxPrice}
        onChange={handleInput}
      />
      <input
        name="minRating"
        placeholder="Min Rating"
        value={local.minRating}
        onChange={handleInput}
      />
      <input
        name="duration"
        placeholder="Duration (days)"
        value={local.duration}
        onChange={handleInput}
      />
      <button type="submit">Apply</button>
    </form>
  );
});

export default SearchFilters;
