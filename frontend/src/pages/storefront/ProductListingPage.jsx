import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { ProductGrid } from '../../components/customer/ProductGrid';
import { FilterSidebar } from '../../components/customer/FilterSidebar';
import { Pagination } from '../../components/common/Pagination';
import { Select } from '../../components/common/Select';
import { SearchBar } from '../../components/common/SearchBar';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating_desc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
];

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current query state from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch products whenever URL search parameters change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const params = {
          page,
          limit: 12,
          sort,
          ...(search && { search }),
          ...(category && { category }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(rating && { rating }),
        };

        const res = await productsApi.getProducts(params);
        if (res.products) {
          setProducts(res.products);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [search, category, minPrice, maxPrice, rating, sort, page]);

  // Update query params helper
  const updateFilters = (newFilters) => {
    const nextParams = new URLSearchParams();

    if (newFilters.search) nextParams.set('search', newFilters.search);
    if (newFilters.category) nextParams.set('category', newFilters.category);
    if (newFilters.minPrice) nextParams.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) nextParams.set('maxPrice', newFilters.maxPrice);
    if (newFilters.rating) nextParams.set('rating', newFilters.rating);
    if (newFilters.sort && newFilters.sort !== 'newest') nextParams.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) nextParams.set('page', String(newFilters.page));

    setSearchParams(nextParams);
  };

  const handleSortChange = (e) => {
    updateFilters({
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort: e.target.value,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    updateFilters({
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page: newPage,
    });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
              : search
              ? `Results for "${search}"`
              : 'Marketplace Catalog'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing verified listings from certified multi-vendor merchant studios
          </p>
        </div>

        {/* Action bar (Sort + Mobile filter toggle) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          <div className="w-48">
            <Select
              value={sort}
              onChange={handleSortChange}
              options={SORT_OPTIONS}
              className="py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            filters={{ category, minPrice, maxPrice, rating, search }}
            onChange={updateFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Products Grid & Pagination */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
            emptyTitle={
              search
                ? `No products found for "${search}"`
                : 'No products match your selected filters'
            }
          />

          {/* Pagination Controls */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Refine Catalog</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 flex-1">
              <FilterSidebar
                filters={{ category, minPrice, maxPrice, rating, search }}
                onChange={(f) => {
                  updateFilters(f);
                  setMobileFilterOpen(false);
                }}
                onReset={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
