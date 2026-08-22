import React from 'react';
import { Building, Scale, BarChart3, Database, MessageSquare } from 'lucide-react';
import { HdbTransaction } from '../types';
import { formatPrice } from '../utils/formatters';

interface NavbarProps {
  unitSystem: 'sqft' | 'sqm';
  onToggleUnitSystem: () => void;
  comparedTransactions: HdbTransaction[];
  onOpenCompare: () => void;
  onOpenInsights: () => void;
  onOpenDataGov?: () => void;
  onOpenOneMap?: () => void;
  onScrollToTalkToUs?: () => void;
  allTransactions: HdbTransaction[];
  dataModeLabel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  unitSystem,
  onToggleUnitSystem,
  comparedTransactions,
  onOpenCompare,
  onOpenInsights,
  onOpenDataGov,
  onOpenOneMap,
  onScrollToTalkToUs,
  allTransactions,
}) => {
  // Compute overall statistics
  const millionCount = allTransactions.filter((tx) => tx.resalePrice >= 1000000).length;
  const avgPrice = allTransactions.length > 0
    ? Math.round(allTransactions.reduce((acc, curr) => acc + curr.resalePrice, 0) / allTransactions.length)
    : 0;
  const avgPsf = allTransactions.length > 0
    ? Math.round(allTransactions.reduce((acc, curr) => acc + curr.psf, 0) / allTransactions.length)
    : 0;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 border-b border-black/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
            <Building className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm sm:text-base text-[#1d1d1f] tracking-tight">
              HDB Explorer
            </span>
            <span className="text-[11px] text-[#86868b] font-medium hidden sm:inline">
              Singapore
            </span>
          </div>
        </div>

        {/* Minimal Metrics (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-[#86868b] font-normal">
          <span>{allTransactions.length} units</span>
          <span className="text-black/20">·</span>
          <span>Median <strong className="font-medium text-[#1d1d1f]">{formatPrice(avgPrice)}</strong></span>
          <span className="text-black/20">·</span>
          <span><strong className="font-medium text-[#1d1d1f]">${avgPsf}</strong>/sqft</span>
          {millionCount > 0 && (
            <>
              <span className="text-black/20">·</span>
              <span><strong className="font-medium text-[#1d1d1f]">{millionCount}</strong> $1M+</span>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* OneMap SLA Button */}
          {onOpenOneMap && (
            <button
              type="button"
              id="btn-nav-onemap-geocoder"
              onClick={onOpenOneMap}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-black/[0.04] rounded-full transition-colors"
              title="OneMap Geocode Search"
            >
              <span>OneMap SLA</span>
            </button>
          )}

          {/* Data.gov.sg API Modal Button */}
          {onOpenDataGov && (
            <button
              type="button"
              id="btn-open-datagov-explorer"
              onClick={onOpenDataGov}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-black/[0.04] rounded-full transition-colors"
              title="Data.gov.sg API Hub"
            >
              <Database className="w-3.5 h-3.5 text-[#86868b]" />
              <span>Data.gov.sg</span>
            </button>
          )}

          {/* Unit Toggle: Sqft / Sqm (Apple Segmented Style) */}
          <div className="flex bg-[#f5f5f7] p-0.5 rounded-full border border-black/[0.04]">
            <button
              type="button"
              id="btn-toggle-sqft"
              onClick={() => unitSystem !== 'sqft' && onToggleUnitSystem()}
              className={`px-2.5 py-0.5 text-xs rounded-full transition-all ${
                unitSystem === 'sqft'
                  ? 'bg-white text-[#1d1d1f] font-medium shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              sqft
            </button>
            <button
              type="button"
              id="btn-toggle-sqm"
              onClick={() => unitSystem !== 'sqm' && onToggleUnitSystem()}
              className={`px-2.5 py-0.5 text-xs rounded-full transition-all ${
                unitSystem === 'sqm'
                  ? 'bg-white text-[#1d1d1f] font-medium shadow-xs'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              sqm
            </button>
          </div>

          {/* Market Trends Button */}
          <button
            type="button"
            id="btn-open-insights"
            onClick={onOpenInsights}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-black/[0.04] rounded-full transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#86868b]" />
            <span className="hidden sm:inline">Trends</span>
          </button>

          {/* Community / Forum Button */}
          {onScrollToTalkToUs && (
            <button
              type="button"
              id="btn-nav-talk-to-us"
              onClick={onScrollToTalkToUs}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1d1d1f] hover:bg-black/[0.04] rounded-full transition-colors"
              title="Talk to Us Forum"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#86868b]" />
              <span className="hidden md:inline">Talk to Us</span>
            </button>
          )}

          {/* Compare Button */}
          <button
            type="button"
            id="btn-open-compare-drawer"
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              comparedTransactions.length > 0
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
            {comparedTransactions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#0071e3] text-[10px] flex items-center justify-center font-bold">
                {comparedTransactions.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

