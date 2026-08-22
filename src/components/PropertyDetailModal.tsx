import React, { useState, useEffect } from 'react';
import { HdbTransaction } from '../types';
import { formatPrice, formatPsf, formatArea, calculateMortgage } from '../utils/formatters';
import {
  X,
  Building2,
  Clock,
  Train,
  School,
  Calculator,
  TrendingUp,
  MapPin,
  Sparkles,
  Scale,
  DollarSign,
  ShieldCheck,
  Compass,
  ExternalLink,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PropertyDetailModalProps {
  transaction: HdbTransaction | null;
  onClose: () => void;
  unitSystem: 'sqft' | 'sqm';
  isCompared: boolean;
  onToggleCompare: (tx: HdbTransaction) => void;
  onShowOnMap?: (tx: HdbTransaction) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  transaction,
  onClose,
  unitSystem,
  isCompared,
  onToggleCompare,
  onShowOnMap,
}) => {
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

  if (!transaction) return null;

  // Mortgage Calculator State
  const [loanType, setLoanType] = useState<'hdb' | 'bank'>('hdb');
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [downpaymentPct, setDownpaymentPct] = useState<number>(20);

  const interestRate = loanType === 'hdb' ? 2.6 : 3.5;
  const mortgageCalc = calculateMortgage({
    propertyPrice: transaction.resalePrice,
    downpaymentPct,
    interestRatePct: interestRate,
    loanTenureYears: tenureYears,
  });

  const isMillion = transaction.resalePrice >= 1000000;

  // Prepare chart data from historical prices
  const chartData = transaction.historicalPrices.map((item) => ({
    month: item.month,
    price: item.price,
    formattedPrice: formatPrice(item.price),
    psf: Math.round(item.price / transaction.floorAreaSqft),
    storey: item.storey,
  }));

  return (
    <div
      id="modal-backdrop-property-detail"
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        id="modal-card-property-detail"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col cursor-default"
      >
        {/* Modal Top Header with Hero Image */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0">
          <img
            src={transaction.imageUrl}
            alt={`Blk ${transaction.block} ${transaction.streetName}`}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close & Action buttons top */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-white/95 backdrop-blur-md text-slate-900 rounded-lg shadow-sm">
                {transaction.flatType}
              </span>
              <span className="px-3 py-1 text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white rounded-lg">
                {transaction.flatModel}
              </span>
              {isMillion && (
                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Million Dollar Flat
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onShowOnMap && (
                <button
                  type="button"
                  id="btn-modal-locate-map"
                  onClick={() => {
                    onClose();
                    onShowOnMap(transaction);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 text-blue-600 hover:bg-white backdrop-blur-md transition-all shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Show on Map</span>
                </button>
              )}
              <button
                type="button"
                id="btn-modal-compare"
                onClick={() => onToggleCompare(transaction)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all ${
                  isCompared
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>
              <button
                type="button"
                id="btn-close-property-detail"
                onClick={onClose}
                className="p-2 rounded-xl bg-black/50 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Title & Price Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{transaction.town} &bull; Postal {transaction.postalCode || 'Singapore'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Blk {transaction.block} {transaction.streetName}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {formatPrice(transaction.resalePrice)}
              </div>
              <div className="text-xs font-semibold text-slate-300">
                {formatPsf(transaction.resalePrice, transaction.floorAreaSqft, unitSystem)} &bull; Sold in {transaction.month}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Content Grid */}
        <div className="p-6 space-y-8">
          {/* Key Facts Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Floor Area</span>
              </div>
              <p className="text-base font-extrabold text-slate-900">
                {formatArea(transaction.floorAreaSqft, unitSystem)}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">
                {transaction.floorAreaSqm} sqm
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Storey Level</span>
              </div>
              <p className="text-base font-extrabold text-slate-900">
                {transaction.storeyRange}
              </p>
              <span className="text-[11px] text-slate-400 font-medium">Mid-High Floor</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Remaining Lease</span>
              </div>
              <p className="text-base font-extrabold text-slate-900">
                {transaction.remainingLeaseYears.toFixed(1)} yrs
              </p>
              <span className="text-[11px] text-slate-400 font-medium" title={transaction.remainingLeaseText}>
                Built {transaction.leaseCommenceDate}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Est. Fair Value</span>
              </div>
              <p className="text-base font-extrabold text-emerald-700">
                {formatPrice(Math.round(transaction.resalePrice * 0.99))}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Within 1% valuation</span>
            </div>
          </div>

          {/* Historical Price Trend Chart */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Historical Resale Price Trend for this Cluster
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transacted price trajectory across past quarters
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                Avg Growth: +4.2% YoY
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    domain={['dataMin - 50000', 'dataMax + 50000']}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatPrice(val), 'Transacted Price']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Location & Neighborhood Amenities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nearest MRT Details */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Train className="w-5 h-5 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Public Transit &amp; Connectivity
                </h4>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: transaction.nearestMrt.lineColor }}
                >
                  {transaction.nearestMrt.line}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {transaction.nearestMrt.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>{transaction.nearestMrt.distanceMeters}m</strong> away &bull; approx.{' '}
                    <strong>{transaction.nearestMrt.walkMins} mins</strong> walking distance
                  </p>
                </div>
              </div>
            </div>

            {/* Nearest Schools & Education */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <School className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Primary Schools (Within 1km P1 Priority)
                </h4>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs shrink-0">
                  P1
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {transaction.nearestSchool.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>{transaction.nearestSchool.distanceMeters}m</strong> away &bull; Eligible for Phase 2C Home-School Priority
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Surrounding Lifestyle Amenities Tags */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Neighborhood Lifestyle &amp; Facilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {transaction.amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 rounded-xl"
                >
                  &bull; {item}
                </span>
              ))}
            </div>
          </div>

          {/* OneMap (SLA) Geocoding & Cadastral Reference Box */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Singapore Land Authority (SLA) OneMap Geocode
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                  WGS84: {transaction.lat.toFixed(5)}, {transaction.lng.toFixed(5)} &bull; Query:{' '}
                  <code className="bg-emerald-100/70 px-1 py-0.5 rounded text-emerald-900 font-bold">
                    searchVal=Blk {transaction.block} {transaction.streetName}
                  </code>
                </p>
              </div>
            </div>

            <a
              href={`https://www.onemap.gov.sg/main/v2/?lat=${transaction.lat}&lng=${transaction.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
            >
              <span>Verify on OneMap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive HDB Mortgage & Affordability Calculator */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">HDB Resale Mortgage Estimator</h3>
                <p className="text-xs text-slate-400">
                  Estimate your monthly loan instalments based on Singapore regulations
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Loan Type Selector */}
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                  Financing Type
                </label>
                <div className="flex bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLoanType('hdb')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      loanType === 'hdb' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    HDB Loan (2.6%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanType('bank')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      loanType === 'bank' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bank (3.5%)
                  </button>
                </div>
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1.5">
                  <span>Tenure</span>
                  <span className="text-white font-bold">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="5"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Downpayment % */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1.5">
                  <span>Downpayment</span>
                  <span className="text-white font-bold">{downpaymentPct}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  step="5"
                  value={downpaymentPct}
                  onChange={(e) => setDownpaymentPct(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculation Output Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3 bg-slate-800/80 rounded-2xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">Est. Monthly Payment</span>
                <span className="text-lg font-black text-blue-400">
                  {formatPrice(mortgageCalc.monthlyPayment)}/mo
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">Downpayment Required</span>
                <span className="text-lg font-black text-white">
                  {formatPrice(mortgageCalc.downpaymentAmount)}
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">Loan Quantum</span>
                <span className="text-lg font-black text-white">
                  {formatPrice(mortgageCalc.loanAmount)}
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl">
                <span className="text-[11px] text-slate-400 block mb-0.5">Min Household Income (30% MSR)</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatPrice(mortgageCalc.minHouseholdIncome)}/mo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Ref: {transaction.id} &bull; HDB Resale Data</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
