import React, { useState, useEffect, useMemo } from 'react';
import { HdbTransaction } from '../types';
import { formatPrice, formatPsf, formatArea, calculateMortgage } from '../utils/formatters';
import { X, Scale, Trash2, ExternalLink, Plus, Sparkles, Building2, Search, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  comparedTransactions: HdbTransaction[];
  onClose: () => void;
  onRemoveTransaction: (id: string) => void;
  onClearAll: () => void;
  onSelectTransaction: (tx: HdbTransaction) => void;
  unitSystem: 'sqft' | 'sqm';
  availableTransactions?: HdbTransaction[];
  onToggleCompare?: (tx: HdbTransaction) => void;
  onAddBenchmarkFlats?: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  comparedTransactions,
  onClose,
  onRemoveTransaction,
  onClearAll,
  onSelectTransaction,
  unitSystem,
  availableTransactions = [],
  onToggleCompare,
  onAddBenchmarkFlats,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isCompared = (id: string) => comparedTransactions.some((t) => t.id === id);

  // Filter available candidate transactions not already in comparison
  const candidateTransactions = useMemo(() => {
    const unselected = availableTransactions.filter((tx) => !isCompared(tx.id));
    if (!searchQuery.trim()) return unselected;
    const q = searchQuery.toLowerCase();
    return unselected.filter(
      (tx) =>
        tx.streetName.toLowerCase().includes(q) ||
        tx.town.toLowerCase().includes(q) ||
        tx.block.toLowerCase().includes(q) ||
        tx.flatType.toLowerCase().includes(q)
    );
  }, [availableTransactions, comparedTransactions, searchQuery]);

  const remainingSlots = Math.max(0, 4 - comparedTransactions.length);

  return (
    <div
      id="modal-backdrop-compare"
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        id="modal-card-compare"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col cursor-default"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-[#0071e3] rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f]">
                Side-by-Side HDB Comparison {comparedTransactions.length > 0 && `(${comparedTransactions.length}/4 Flats)`}
              </h2>
              <p className="text-xs text-[#86868b]">
                Compare price, PSF, lease, distance to MRT, and monthly mortgage estimates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparedTransactions.length > 0 && (
              <button
                type="button"
                id="btn-clear-all-compare"
                onClick={onClearAll}
                className="text-xs font-medium text-[#86868b] hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {comparedTransactions.length === 0 ? (
          <div className="p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0071e3] flex items-center justify-center mb-4">
              <Scale className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
              No flats selected for comparison yet
            </h3>
            <p className="text-xs sm:text-sm text-[#86868b] max-w-md mb-6">
              You can add up to 4 properties by clicking the <strong className="text-[#1d1d1f] font-medium">+ Compare</strong> button on any property card or map pin.
            </p>

            {onAddBenchmarkFlats && (
              <button
                type="button"
                onClick={onAddBenchmarkFlats}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 mb-8 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Compare 3 Benchmark Units Instantly</span>
              </button>
            )}

            {/* Quick Pick from Available Units */}
            {availableTransactions.length > 0 && onToggleCompare && (
              <div className="w-full text-left mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                    Quick Add to Comparison
                  </h4>
                  <span className="text-[11px] text-[#86868b]">Click any unit below to compare</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTransactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-2xl border border-black/[0.04] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-[#0071e3] block">
                          {tx.flatType} • {tx.town}
                        </span>
                        <p className="text-xs font-medium text-[#1d1d1f] truncate">
                          Blk {tx.block} {tx.streetName}
                        </p>
                        <span className="text-xs font-semibold text-[#1d1d1f]">
                          {formatPrice(tx.resalePrice)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleCompare(tx)}
                        className="px-3.5 py-1.5 bg-[#0071e3] text-white text-xs font-medium rounded-full shrink-0 hover:bg-[#0077ed] transition-colors cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Content Table / Matrix */
          <div className="p-6 flex flex-col gap-6">
            {/* Notification / Suggestion Banner when slots available */}
            {remainingSlots > 0 && (
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0071e3] shrink-0" />
                  <span>
                    You have <strong>{remainingSlots} more slot{remainingSlots > 1 ? 's' : ''}</strong> available for comparison. Pick a flat below or search!
                  </span>
                </div>
                {onAddBenchmarkFlats && (
                  <button
                    type="button"
                    onClick={onAddBenchmarkFlats}
                    className="text-xs font-semibold text-[#0071e3] hover:text-[#005bb5] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>+ Add Suggested Peers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider w-40">
                      Feature
                    </th>
                    {comparedTransactions.map((tx) => (
                      <th key={tx.id} className="py-3 px-4 min-w-[240px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                              {tx.flatType}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                              Blk {tx.block} {tx.streetName}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">{tx.town}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveTransaction(tx.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}

                    {/* Placeholder Slot Column if less than 4 */}
                    {remainingSlots > 0 && onToggleCompare && (
                      <th className="py-3 px-4 min-w-[200px] border-l border-dashed border-slate-200 bg-slate-50/50">
                        <div className="text-center py-2">
                          <span className="text-[11px] font-semibold text-[#86868b] block">
                            Slot {comparedTransactions.length + 1} of 4
                          </span>
                          <span className="text-xs font-medium text-[#0071e3] mt-0.5 block">
                            + Add Another Flat
                          </span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {/* Photo */}
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-500">Preview</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4">
                        <img
                          src={tx.imageUrl}
                          alt={tx.streetName}
                          className="w-full h-28 object-cover rounded-xl border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                    ))}
                    {remainingSlots > 0 && (
                      <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center">
                        <div className="h-28 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-3 text-slate-400">
                          <Plus className="w-6 h-6 mb-1" />
                          <span className="text-[10px]">Select below</span>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Transacted Price */}
                  <tr className="bg-slate-50/60 font-semibold">
                    <td className="py-3.5 px-4 text-slate-800 font-bold">Transacted Price</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3.5 px-4 text-base font-black text-[#0071e3]">
                        {formatPrice(tx.resalePrice)}
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3.5 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Price PSF / PSM */}
                  <tr>
                    <td className="py-3 px-4 text-slate-600 font-medium">Unit Rate ({unitSystem})</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4 font-bold text-slate-900">
                        {formatPsf(tx.resalePrice, tx.floorAreaSqft, unitSystem)}
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Floor Area */}
                  <tr>
                    <td className="py-3 px-4 text-slate-600 font-medium">Floor Area</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4 font-bold text-slate-900">
                        {formatArea(tx.floorAreaSqft, unitSystem)} ({tx.floorAreaSqm} sqm)
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Storey Range */}
                  <tr>
                    <td className="py-3 px-4 text-slate-600 font-medium">Storey Level</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4 font-bold text-slate-800">
                        {tx.storeyRange}
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Flat Model */}
                  <tr>
                    <td className="py-3 px-4 text-slate-600 font-medium">Flat Model</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4 font-bold text-slate-800">
                        {tx.flatModel}
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Remaining Lease */}
                  <tr className="bg-slate-50">
                    <td className="py-3 px-4 text-slate-900 font-bold">Remaining Lease</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4 font-extrabold text-blue-900">
                        {tx.remainingLeaseYears.toFixed(1)} yrs ({tx.remainingLeaseText})
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Nearest MRT */}
                  <tr>
                    <td className="py-3 px-4 text-slate-600 font-medium">Nearest MRT</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {tx.nearestMrt.name.split('(')[0]}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {tx.nearestMrt.distanceMeters}m ({tx.nearestMrt.walkMins} mins)
                        </span>
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Nearest School */}
                  <tr>
                    <td className="py-3 px-4 text-slate-600 font-medium">Primary School</td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {tx.nearestSchool.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {tx.nearestSchool.distanceMeters}m
                        </span>
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-3 px-4 border-l border-dashed border-slate-200 bg-slate-50/50 text-center text-slate-400">-</td>}
                  </tr>

                  {/* Est. HDB Loan Payment (25y @ 2.6%) */}
                  <tr className="bg-slate-900 text-white">
                    <td className="py-4 px-4 font-bold text-blue-300">
                      Est. Loan Repayment (25y @ 2.6%)
                    </td>
                    {comparedTransactions.map((tx) => {
                      const calc = calculateMortgage({
                        propertyPrice: tx.resalePrice,
                        downpaymentPct: 20,
                        interestRatePct: 2.6,
                        loanTenureYears: 25,
                      });
                      return (
                        <td key={tx.id} className="py-4 px-4">
                          <div className="text-sm font-black text-blue-400">
                            {formatPrice(calc.monthlyPayment)}/mo
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Downpayment: {formatPrice(calc.downpaymentAmount)}
                          </div>
                        </td>
                      );
                    })}
                    {remainingSlots > 0 && <td className="py-4 px-4 border-l border-dashed border-slate-800 bg-slate-900/80 text-center text-slate-500">-</td>}
                  </tr>

                  {/* Action Link */}
                  <tr>
                    <td className="py-4 px-4"></td>
                    {comparedTransactions.map((tx) => (
                      <td key={tx.id} className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectTransaction(tx);
                          }}
                          className="w-full py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <span>View Full Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                    {remainingSlots > 0 && <td className="py-4 px-4 border-l border-dashed border-slate-200 bg-slate-50/50"></td>}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Persistent Quick-Add Section for Remaining Slots */}
            {remainingSlots > 0 && onToggleCompare && candidateTransactions.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] flex items-center gap-2">
                      <span>Add More Flats ({remainingSlots} slot{remainingSlots > 1 ? 's' : ''} left)</span>
                    </h4>
                    <p className="text-[11px] text-[#86868b]">
                      Click + Add on any property below to compare it side-by-side
                    </p>
                  </div>

                  {/* Quick Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search street, block, town..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#f5f5f7] border border-black/[0.06] rounded-xl text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {candidateTransactions.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-2xl border border-black/[0.04] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-[#0071e3] block">
                          {tx.flatType} • {tx.town}
                        </span>
                        <p className="text-xs font-medium text-[#1d1d1f] truncate">
                          Blk {tx.block} {tx.streetName}
                        </p>
                        <span className="text-xs font-semibold text-[#1d1d1f]">
                          {formatPrice(tx.resalePrice)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleCompare(tx)}
                        className="px-3.5 py-1.5 bg-[#0071e3] text-white text-xs font-semibold rounded-full shrink-0 hover:bg-[#0077ed] transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


