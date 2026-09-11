import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Filter } from 'lucide-react';
import { categoriesApi } from '../../api/categories';

export const FilterSidebar = ({
  filters = {},
  onChange,
  onReset,
  className = '',
}) => {
  const [categories, setCategories] = useState([]);
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice || '');
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice || '');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoriesApi.getCategories();
        if (res.categories) setCategories(res.categories);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    setMinPriceInput(filters.minPrice || '');
    setMaxPriceInput(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const handleCategoryClick = (slug) => {
    const newCat = filters.category === slug ? '' : slug;
    onChange({ ...filters, category: newCat, page: 1 });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    onChange({
      ...filters,
      minPrice: minPriceInput || undefined,
      maxPrice: maxPriceInput || undefined,
      page: 1,
    });
  };

  const handleRatingClick = (rating) => {
    const newRating = filters.rating === String(rating) ? undefined : String(rating);
    onChange({ ...filters, rating: newRating, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.rating ||
    filters.search
  );

  return (
    <aside className={`w-full bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle divide-y divide-slate-100 ${className}`}>
      {/* Header */}
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Refine Catalog</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="py-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => handleCategoryClick('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              !filters.category
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug || String(filters.category) === String(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span className="text-[11px] text-slate-400">({cat.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="py-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
          Price Range ($)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400 font-semibold">
                $
              </span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-slate-400 text-xs">to</span>
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400 font-semibold">
                $
              </span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Apply Price
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {[
            { label: '< $100', max: 100 },
            { label: '$100 - $300', min: 100, max: 300 },
            { label: '$300+', min: 300 },
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setMinPriceInput(preset.min ? String(preset.min) : '');
                setMaxPriceInput(preset.max ? String(preset.max) : '');
                onChange({
                  ...filters,
                  minPrice: preset.min ? String(preset.min) : undefined,
                  maxPrice: preset.max ? String(preset.max) : undefined,
                  page: 1,
                });
              }}
              className="text-[11px] px-2 py-1 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => {
            const isSelected = filters.rating === String(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => handleRatingClick(stars)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-slate-700">& up</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
