import React, { useState, useMemo, useEffect } from 'react';
import { HdbTransaction, FilterState } from './types';
import { HDB_TRANSACTIONS, INITIAL_FILTER_STATE } from './data/hdbData';
import { filterTransactions } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { CompareModal } from './components/CompareModal';
import { MarketInsightsModal } from './components/MarketInsightsModal';
import { DataGovExplorerModal } from './components/DataGovExplorerModal';
import { TalkToUsSection } from './components/TalkToUsSection';
import {
  fetchDataGovTransactions,
  DATA_GOV_PRESETS,
} from './services/hdbApiService';
import {
  Map,
  List,
  Database,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Scale,
  ArrowRight,
  ArrowUp,
  Building2,
} from 'lucide-react';

export default function App() {
  const [allTransactions, setAllTransactions] = useState<HdbTransaction[]>(HDB_TRANSACTIONS);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('Curated Singapore HDB Dataset (50 Units)');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [selectedTransaction, setSelectedTransaction] = useState<HdbTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [comparedTransactions, setComparedTransactions] = useState<HdbTransaction[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isDataGovModalOpen, setIsDataGovModalOpen] = useState(false);
  const [apiModalInitialService, setApiModalInitialService] = useState<'datagov' | 'onemap'>('onemap');
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll position to show/hide floating back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mobile layout state
  const filteredTransactions = useMemo(() => {
    return filterTransactions(allTransactions, filters);
  }, [allTransactions, filters]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  const handleToggleUnitSystem = () => {
    setFilters((prev) => ({
      ...prev,
      unitSystem: prev.unitSystem === 'sqft' ? 'sqm' : 'sqft',
    }));
  };

  const scrollToMap = () => {
    const el = document.getElementById('singapore-map-section');
    if (el) {
      // Offset for sticky navbar & filter bar (~115px) so the full map is displayed
      const y = el.getBoundingClientRect().top + window.pageYOffset - 115;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const handleScrollToListing = (tx: HdbTransaction) => {
    setSelectedTransaction(tx);
    const el = document.getElementById(`property-card-${tx.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const section = document.getElementById('property-listings-section');
      section?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectTransaction = (tx: HdbTransaction) => {
    setSelectedTransaction(tx);
  };

  const handleOpenDetailModal = (tx: HdbTransaction) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const handleToggleCompare = (tx: HdbTransaction) => {
    setComparedTransactions((prev) => {
      const exists = prev.some((item) => item.id === tx.id);
      if (exists) {
        showToast(`Removed Blk ${tx.block} ${tx.streetName} from comparison`);
        return prev.filter((item) => item.id !== tx.id);
      }
      if (prev.length >= 4) {
        showToast('Maximum 4 properties can be compared simultaneously');
        return prev;
      }
      showToast(`Added Blk ${tx.block} ${tx.streetName} to comparison (${prev.length + 1}/4)`);
      return [...prev, tx];
    });
  };

  const handleRemoveCompared = (id: string) => {
    setComparedTransactions((prev) => {
      const removed = prev.find((t) => t.id === id);
      if (removed) {
        showToast(`Removed Blk ${removed.block} ${removed.streetName} from comparison`);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const handleClearAllCompared = () => {
    setComparedTransactions([]);
    showToast('Cleared all properties from comparison');
  };

  const handleAddBenchmarkFlats = () => {
    setComparedTransactions((prev) => {
      const candidates = allTransactions.filter((tx) => !prev.some((p) => p.id === tx.id));
      const remainingSlots = Math.max(0, 4 - prev.length);
      if (remainingSlots === 0) {
        showToast('Maximum 4 properties can be compared simultaneously');
        return prev;
      }
      const toAdd = candidates.slice(0, Math.min(remainingSlots, 3));
      if (toAdd.length === 0) {
        showToast('No additional properties available to add');
        return prev;
      }
      const updated = [...prev, ...toAdd];
      showToast(`Added ${toAdd.length} peer properties to comparison (${updated.length}/4)`);
      return updated;
    });
  };

  // Handle Preset Quick Click from Filter Bar
  const handleSelectPresetQuery = async (presetId: string) => {
    if (presetId === 'curated') {
      setAllTransactions(HDB_TRANSACTIONS);
      setDataSourceLabel('Curated Benchmark Dataset (50 Units)');
      showToast('Loaded 50 curated benchmark transactions island-wide');
      return;
    }

    const preset = DATA_GOV_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setIsApiLoading(true);
    try {
      const result = await fetchDataGovTransactions(preset.params);
      if (result.transactions.length > 0) {
        setAllTransactions(result.transactions);
        setDataSourceLabel(`Data.gov.sg: ${preset.label} (${result.transactions.length} records)`);
        showToast(`Loaded ${result.transactions.length} live records from Data.gov.sg in ${result.executionTimeMs}ms`);
        setSelectedTransaction(result.transactions[0]);
      } else {
        showToast('Data.gov.sg returned 0 records for this query');
      }
    } catch (err) {
      console.error('Failed to fetch from Data.gov.sg', err);
      showToast('Error connecting to Data.gov.sg API. Please retry.');
    } finally {
      setIsApiLoading(false);
    }
  };

  // Handle applied transactions from Modal
  const handleApplyTransactionsFromModal = (transactions: HdbTransaction[], label: string) => {
    if (transactions.length > 0) {
      setAllTransactions(transactions);
      setDataSourceLabel(`Data.gov.sg: ${label} (${transactions.length} records)`);
      setSelectedTransaction(transactions[0]);
      showToast(`Applied ${transactions.length} records from Data.gov.sg to map & explorer`);
    }
  };

  const scrollToTalkToUs = () => {
    const el = document.getElementById('talk-to-us-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1d1d1f] text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        unitSystem={filters.unitSystem}
        onToggleUnitSystem={handleToggleUnitSystem}
        comparedTransactions={comparedTransactions}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenInsights={() => setIsInsightsModalOpen(true)}
        onOpenDataGov={() => {
          setApiModalInitialService('datagov');
          setIsDataGovModalOpen(true);
        }}
        onOpenOneMap={() => {
          setApiModalInitialService('onemap');
          setIsDataGovModalOpen(true);
        }}
        onScrollToTalkToUs={scrollToTalkToUs}
        allTransactions={allTransactions}
        dataModeLabel={dataSourceLabel}
      />

      {/* Sticky Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={filteredTransactions.length}
        onOpenDataGov={() => {
          setApiModalInitialService('datagov');
          setIsDataGovModalOpen(true);
        }}
        onOpenOneMap={() => {
          setApiModalInitialService('onemap');
          setIsDataGovModalOpen(true);
        }}
        onSelectPresetQuery={handleSelectPresetQuery}
        activeDataMode={dataSourceLabel}
        isApiLoading={isApiLoading}
      />

      {/* Full-Width Interactive Map taking up space from left to right */}
      <section id="singapore-map-section" className="w-full relative border-b border-black/[0.06] bg-[#6ba4e8] isolate z-0">
        <div className="w-full h-[480px] sm:h-[540px] lg:h-[600px]">
          <MapView
            transactions={filteredTransactions}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={handleSelectTransaction}
            onOpenDetailModal={handleOpenDetailModal}
            onToggleCompare={handleToggleCompare}
            isCompared={(id) => comparedTransactions.some((t) => t.id === id)}
            unitSystem={filters.unitSystem}
            onOpenOneMapSearch={() => {
              setApiModalInitialService('onemap');
              setIsDataGovModalOpen(true);
            }}
            onScrollToListing={handleScrollToListing}
          />
        </div>
      </section>

      {/* Property Listings Section Below the Map */}
      <section id="property-listings-section" className="w-full bg-[#fbfbfd] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Listings Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                HDB Resale Properties
              </h2>
              <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                Showing {filteredTransactions.length} matching transactions across Singapore
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollToMap}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] border border-black/[0.06] text-xs font-medium rounded-full transition-all shadow-xs cursor-pointer"
              >
                <Map className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>View on Map</span>
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          {isApiLoading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-black/[0.04] shadow-xs my-8 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#0071e3] animate-spin" />
              <h3 className="text-sm font-medium text-[#1d1d1f]">
                Loading transactions...
              </h3>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-black/[0.04] shadow-xs my-8">
              <h3 className="text-base font-semibold text-[#1d1d1f]">No transactions found</h3>
              <p className="text-xs text-[#86868b] max-w-xs mx-auto mt-1 mb-4">
                Try adjusting your filters or search keywords.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 bg-[#0071e3] text-white rounded-full text-xs font-medium hover:bg-[#0077ed] transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetQuery('curated')}
                  className="px-4 py-1.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-full text-xs font-medium hover:bg-[#e8e8ed] transition-colors"
                >
                  Load All
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredTransactions.map((tx) => (
                <PropertyCard
                  key={tx.id}
                  transaction={tx}
                  isSelected={selectedTransaction?.id === tx.id}
                  isCompared={comparedTransactions.some((t) => t.id === tx.id)}
                  unitSystem={filters.unitSystem}
                  onSelect={(item) => {
                    setSelectedTransaction(item);
                    scrollToMap();
                  }}
                  onOpenDetail={handleOpenDetailModal}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Talk to Us & Community Forum Section at Bottom */}
      <TalkToUsSection id="talk-to-us-section" />

      {/* Landing Page Footer */}
      <footer className="w-full bg-[#f5f5f7] border-t border-black/[0.06] py-8 px-4 sm:px-6 lg:px-8 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pr-0 sm:pr-36">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-[#0071e3] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1d1d1f]">
                Singapore HDB Resale Explorer
              </p>
              <p className="text-[11px] text-[#86868b]">
                Real-time official data powered by OneMap SLA &amp; Data.gov.sg
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#86868b] text-center sm:text-right">
            &copy; {new Date().getFullYear()} Singapore HDB Resale Explorer. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          id="btn-floating-back-to-top"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 hover:bg-white text-[#1d1d1f] backdrop-blur-md rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.14)] border border-black/[0.08] hover:border-black/[0.18] transition-all hover:scale-105 active:scale-95 cursor-pointer group animate-in fade-in slide-in-from-bottom-2 duration-200"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4 text-[#0071e3] group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs font-semibold text-[#1d1d1f]">Back to Top</span>
        </button>
      )}

      {/* Singapore Gov & OneMap Live API Explorer Modal */}
      {isDataGovModalOpen && (
        <DataGovExplorerModal
          initialService={apiModalInitialService}
          onClose={() => setIsDataGovModalOpen(false)}
          onApplyTransactionsToApp={handleApplyTransactionsFromModal}
        />
      )}

      {/* Property Details Modal */}
      {isDetailModalOpen && (
        <PropertyDetailModal
          transaction={selectedTransaction}
          onClose={() => setIsDetailModalOpen(false)}
          unitSystem={filters.unitSystem}
          isCompared={
            selectedTransaction
              ? comparedTransactions.some((t) => t.id === selectedTransaction.id)
              : false
          }
          onToggleCompare={handleToggleCompare}
          onShowOnMap={(tx) => {
            setIsDetailModalOpen(false);
            scrollToMap();
            // Create a fresh reference so MapView effect re-triggers even if tx was previously selected
            setSelectedTransaction({ ...tx });
          }}
        />
      )}

      {/* Floating Bottom Comparison Bar (Apple Dock style) */}
      {comparedTransactions.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1d1d1f] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-[0_16px_32px_rgba(0,0,0,0.25)] flex items-center gap-3 sm:gap-4 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {comparedTransactions.length}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">
              {comparedTransactions.length === 1 ? '1 property' : `${comparedTransactions.length} properties`} selected
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/20" />

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-floating-compare-action"
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-semibold transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>
            <button
              type="button"
              id="btn-floating-compare-clear"
              onClick={handleClearAllCompared}
              className="px-2.5 py-1.5 text-xs text-[#86868b] hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <CompareModal
          comparedTransactions={comparedTransactions}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveTransaction={handleRemoveCompared}
          onClearAll={handleClearAllCompared}
          onSelectTransaction={handleOpenDetailModal}
          unitSystem={filters.unitSystem}
          availableTransactions={allTransactions}
          onToggleCompare={handleToggleCompare}
          onAddBenchmarkFlats={handleAddBenchmarkFlats}
        />
      )}

      {/* Market Insights & Analytics Modal */}
      {isInsightsModalOpen && (
        <MarketInsightsModal
          transactions={allTransactions}
          onClose={() => setIsInsightsModalOpen(false)}
          onSelectTransaction={handleOpenDetailModal}
        />
      )}
    </div>
  );
}

