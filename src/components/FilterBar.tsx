import React, { useState } from 'react';
import { FilterState } from '../types';
import { SINGAPORE_TOWNS, FLAT_TYPES, FLAT_MODELS } from '../data/hdbData';
import { formatPrice } from '../utils/formatters';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
  Train,
  Check,
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
  onOpenDataGov?: () => void;
  onOpenOneMap?: () => void;
  onSelectPresetQuery?: (presetId: string) => void;
  activeDataMode?: string;
  isApiLoading?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  onSelectPresetQuery,
}) => {
  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleTownToggle = (townName: string) => {
    const nextTowns = filters.towns.includes(townName)
      ? filters.towns.filter((t) => t !== townName)
      : [...filters.towns, townName];
    onFilterChange({ towns: nextTowns });
  };

  const handleFlatTypeToggle = (type: string) => {
    const nextTypes = filters.flatTypes.includes(type)
      ? filters.flatTypes.filter((t) => t !== type)
      : [...filters.flatTypes, type];
    onFilterChange({ flatTypes: nextTypes });
  };

  const activeFiltersCount =
    (filters.towns.length > 0 ? 1 : 0) +
    (filters.flatTypes.length > 0 ? 1 : 0) +
    (filters.minPrice > 300000 || filters.maxPrice < 1600000 ? 1 : 0) +
    (filters.minRemainingLease > 40 || filters.maxRemainingLease < 99 ? 1 : 0) +
    (filters.minSizeSqft > 400 || filters.maxSizeSqft < 1800 ? 1 : 0) +
    (filters.storeyCategories.length > 0 ? 1 : 0) +
    (filters.flatModels.length > 0 ? 1 : 0) +
    (filters.millionDollarOnly ? 1 : 0) +
    (filters.nearMrtOnly ? 1 : 0);

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-black/[0.05] sticky top-14 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col gap-2">
        {/* Main Filter & Search Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input
              type="text"
              id="search-input"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search town, street, blk, or MRT..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#f5f5f7] border-0 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 transition-all font-normal placeholder:text-[#86868b]"
            />
            {filters.searchQuery && (
              <button
                type="button"
                id="btn-clear-search"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter: Town */}
          <div className="relative">
            <button
              type="button"
              id="btn-filter-towns"
              onClick={() => toggleDropdown('towns')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-all ${
                filters.towns.length > 0
                  ? 'bg-[#1d1d1f] text-white shadow-xs'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              <span>
                {filters.towns.length === 0
                  ? 'Town'
                  : filters.towns.length === 1
                  ? filters.towns[0]
                  : `${filters.towns.length} Towns`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeDropdown === 'towns' && (
              <div className="absolute left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-black/[0.06] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-[#1d1d1f]">Select Towns</span>
                  {filters.towns.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ towns: [] })}
                      className="text-[11px] font-medium text-[#0071e3] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {SINGAPORE_TOWNS.map((town) => {
                    const checked = filters.towns.includes(town.name);
                    return (
                      <label
                        key={town.name}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#f5f5f7] cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTownToggle(town.name)}
                            className="rounded border-slate-300 text-[#0071e3] focus:ring-[#0071e3]"
                          />
                          <span className={checked ? 'font-semibold text-[#0071e3]' : 'text-[#1d1d1f]'}>
                            {town.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#86868b]">
                          {town.region}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Filter: Flat Type */}
          <div className="relative">
            <button
              type="button"
              id="btn-filter-flat-types"
              onClick={() => toggleDropdown('flatTypes')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-all ${
                filters.flatTypes.length > 0
                  ? 'bg-[#1d1d1f] text-white shadow-xs'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              <span>
                {filters.flatTypes.length === 0
                  ? 'Flat Type'
                  : filters.flatTypes.length === 1
                  ? filters.flatTypes[0]
                  : `${filters.flatTypes.length} Types`}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeDropdown === 'flatTypes' && (
              <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-black/[0.06] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-[#1d1d1f]">Flat Types</span>
                  {filters.flatTypes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ flatTypes: [] })}
                      className="text-[11px] font-medium text-[#0071e3] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-0.5">
                  {FLAT_TYPES.map((type) => {
                    const checked = filters.flatTypes.includes(type);
                    return (
                      <label
                        key={type}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f5f5f7] cursor-pointer text-xs transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleFlatTypeToggle(type)}
                          className="rounded border-slate-300 text-[#0071e3] focus:ring-[#0071e3]"
                        />
                        <span className={checked ? 'font-semibold text-[#0071e3]' : 'text-[#1d1d1f]'}>
                          {type}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Filter: Price */}
          <div className="relative">
            <button
              type="button"
              id="btn-filter-price"
              onClick={() => toggleDropdown('price')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-all ${
                filters.minPrice > 300000 || filters.maxPrice < 1600000
                  ? 'bg-[#1d1d1f] text-white shadow-xs'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              }`}
            >
              <span>
                {filters.minPrice > 300000 || filters.maxPrice < 1600000
                  ? `${formatPrice(filters.minPrice, true)} - ${formatPrice(filters.maxPrice, true)}`
                  : 'Price'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeDropdown === 'price' && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-black/[0.06] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-xs font-semibold text-[#1d1d1f] block mb-2">Price Limit (SGD)</span>
                <div className="flex items-center justify-between text-xs text-[#86868b] mb-2 font-medium">
                  <span>{formatPrice(filters.minPrice)}</span>
                  <span className="text-[#0071e3] font-semibold">{formatPrice(filters.maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="1600000"
                  step="25000"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
                  className="w-full accent-[#0071e3] cursor-pointer"
                />
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ minPrice: 300000, maxPrice: 600000 })}
                    className="flex-1 py-1 text-[11px] font-medium bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full text-[#1d1d1f] transition-colors"
                  >
                    &lt; $600k
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ minPrice: 600000, maxPrice: 1000000 })}
                    className="flex-1 py-1 text-[11px] font-medium bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full text-[#1d1d1f] transition-colors"
                  >
                    $600k - $1M
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ minPrice: 1000000, maxPrice: 1600000 })}
                    className="flex-1 py-1 text-[11px] font-medium bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full text-[#1d1d1f] transition-colors"
                  >
                    $1M+
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Toggle: Near MRT */}
          <button
            type="button"
            id="btn-toggle-near-mrt"
            onClick={() => onFilterChange({ nearMrtOnly: !filters.nearMrtOnly })}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full transition-all ${
              filters.nearMrtOnly
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Near MRT</span>
            {filters.nearMrtOnly && <Check className="w-3 h-3" />}
          </button>

          {/* All Filters Button */}
          <button
            type="button"
            id="btn-all-filters"
            onClick={() => setIsAllFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full bg-[#1d1d1f] text-white hover:bg-black transition-all shadow-xs ml-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0071e3] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Sub-row: Quick Presets & Status info */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#86868b] pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              <strong className="font-semibold text-[#1d1d1f]">{totalResults}</strong> units found
            </span>

            {/* Quick Presets */}
            {onSelectPresetQuery && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-[#86868b]">Presets:</span>
                <button
                  type="button"
                  onClick={() => onSelectPresetQuery('latest-recent-100')}
                  className="px-2 py-0.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[11px] text-[#1d1d1f] transition-colors"
                >
                  Latest 100
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPresetQuery('tampines-4room')}
                  className="px-2 py-0.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[11px] text-[#1d1d1f] transition-colors"
                >
                  Tampines 4R
                </button>
              </div>
            )}

            {/* Active Tag Chips */}
            {filters.towns.map((town) => (
              <span
                key={town}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[11px] font-medium"
              >
                {town}
                <button
                  type="button"
                  onClick={() => handleTownToggle(town)}
                  className="text-[#86868b] hover:text-[#1d1d1f]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                id="btn-reset-all-filters"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0071e3] hover:underline ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[#86868b] text-[11px] hidden sm:inline">Sort:</span>
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="bg-[#f5f5f7] border-0 rounded-full px-3 py-1 text-xs text-[#1d1d1f] font-medium focus:outline-none focus:ring-1 focus:ring-[#0071e3] cursor-pointer"
            >
              <option value="date_desc">Latest Transaction</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="psf_desc">PSF: High to Low</option>
              <option value="psf_asc">PSF: Low to High</option>
              <option value="size_desc">Floor Area: Largest</option>
              <option value="lease_desc">Remaining Lease: Longest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* All Filters Modal */}
      {isAllFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-black/[0.06] w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-black/[0.06] flex items-center justify-between z-10">
              <div>
                <h2 className="text-base font-semibold text-[#1d1d1f]">Filters</h2>
                <p className="text-xs text-[#86868b]">Refine property criteria</p>
              </div>
              <button
                type="button"
                id="btn-close-filter-modal"
                onClick={() => setIsAllFiltersOpen(false)}
                className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Flat Models */}
              <div>
                <label className="text-xs font-medium text-[#86868b] block mb-2">
                  Flat Models
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FLAT_MODELS.map((model) => {
                    const checked = filters.flatModels.includes(model);
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? filters.flatModels.filter((m) => m !== model)
                            : [...filters.flatModels, model];
                          onFilterChange({ flatModels: next });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          checked
                            ? 'bg-[#1d1d1f] text-white shadow-xs'
                            : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                        }`}
                      >
                        {model}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Storey Ranges */}
              <div>
                <label className="text-xs font-medium text-[#86868b] block mb-2">
                  Storey Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low (1-6 Flr)', 'Mid (7-15 Flr)', 'High (16+ Flr)'].map((storey) => {
                    const checked = filters.storeyCategories.includes(storey);
                    return (
                      <button
                        key={storey}
                        type="button"
                        onClick={() => {
                          const next = checked
                            ? filters.storeyCategories.filter((s) => s !== storey)
                            : [...filters.storeyCategories, storey];
                          onFilterChange({ storeyCategories: next });
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                          checked
                            ? 'bg-[#0071e3] text-white'
                            : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                        }`}
                      >
                        {storey}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Property Floor Area (Sqft) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#86868b]">
                    Property Size Range
                  </label>
                  <span className="text-xs font-medium text-[#0071e3]">
                    {filters.minSizeSqft} sqft - {filters.maxSizeSqft} sqft
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-[#86868b] block mb-1">Min (sqft)</span>
                    <input
                      type="number"
                      value={filters.minSizeSqft}
                      onChange={(e) => onFilterChange({ minSizeSqft: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-[#f5f5f7] rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#86868b] block mb-1">Max (sqft)</span>
                    <input
                      type="number"
                      value={filters.maxSizeSqft}
                      onChange={(e) => onFilterChange({ maxSizeSqft: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-[#f5f5f7] rounded-xl focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#f5f5f7] px-6 py-3.5 border-t border-black/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-medium text-[#86868b] hover:text-[#1d1d1f]"
              >
                Reset
              </button>
              <button
                type="button"
                id="btn-apply-filters"
                onClick={() => setIsAllFiltersOpen(false)}
                className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium rounded-full shadow-xs transition-colors"
              >
                Done ({totalResults} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
