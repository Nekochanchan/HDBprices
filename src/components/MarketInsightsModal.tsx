import React, { useEffect } from 'react';
import { HdbTransaction } from '../types';
import { formatPrice } from '../utils/formatters';
import { X, BarChart3, TrendingUp, Sparkles, Building, MapPin } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

interface MarketInsightsModalProps {
  transactions: HdbTransaction[];
  onClose: () => void;
  onSelectTransaction: (tx: HdbTransaction) => void;
}

export const MarketInsightsModal: React.FC<MarketInsightsModalProps> = ({
  transactions,
  onClose,
  onSelectTransaction,
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

  // Aggregate data by Town
  const townMap = new Map<string, { total: number; count: number; maxPrice: number }>();
  transactions.forEach((tx) => {
    const existing = townMap.get(tx.town) || { total: 0, count: 0, maxPrice: 0 };
    existing.total += tx.resalePrice;
    existing.count += 1;
    existing.maxPrice = Math.max(existing.maxPrice, tx.resalePrice);
    townMap.set(tx.town, existing);
  });

  const townChartData = Array.from(townMap.entries())
    .map(([town, data]) => ({
      town,
      avgPrice: Math.round(data.total / data.count),
      count: data.count,
      maxPrice: data.maxPrice,
    }))
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 10);

  // Aggregate by Flat Type
  const flatTypeMap = new Map<string, { total: number; count: number; totalPsf: number }>();
  transactions.forEach((tx) => {
    const existing = flatTypeMap.get(tx.flatType) || { total: 0, count: 0, totalPsf: 0 };
    existing.total += tx.resalePrice;
    existing.totalPsf += tx.psf;
    existing.count += 1;
    flatTypeMap.set(tx.flatType, existing);
  });

  const flatTypeData = Array.from(flatTypeMap.entries()).map(([type, data]) => ({
    type,
    avgPrice: Math.round(data.total / data.count),
    avgPsf: Math.round(data.totalPsf / data.count),
    count: data.count,
  }));

  // Million dollar transactions list
  const millionFlats = transactions
    .filter((tx) => tx.resalePrice >= 1000000)
    .sort((a, b) => b.resalePrice - a.resalePrice);

  return (
    <div
      id="modal-backdrop-insights"
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        id="modal-card-insights"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col cursor-default"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Singapore HDB Resale Market Insights &amp; Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Macro market analysis, top town medians, and benchmark transactions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-8">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Towns by Median Price */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Top 10 HDB Towns by Average Resale Price
                  </h3>
                  <p className="text-xs text-slate-500">Ranked by latest transaction values</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={townChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="town"
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      width={90}
                    />
                    <Tooltip
                      formatter={(v: number) => [formatPrice(v), 'Average Resale Price']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="avgPrice" radius={[0, 6, 6, 0]}>
                      {townChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index < 3 ? '#2563eb' : '#475569'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Flat Type Breakdown */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Average Resale Price &amp; PSF by Flat Type
                  </h3>
                  <p className="text-xs text-slate-500">Room size comparison</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={flatTypeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="type"
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                    />
                    <YAxis
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip
                      formatter={(v: number) => [formatPrice(v), 'Avg Price']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="avgPrice" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Million Dollar Flats Showcase Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Million-Dollar HDB Resale Club ({millionFlats.length} Benchmark Units)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Premium DBSS, City-Centre &amp; Pinnacle @ Duxton flagship transactions
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {millionFlats.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    onClose();
                    onSelectTransaction(tx);
                  }}
                  className="p-3.5 bg-gradient-to-br from-blue-50/50 via-slate-50 to-transparent border border-blue-100 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-blue-600 text-white rounded-md">
                        {tx.flatType}
                      </span>
                      <span className="text-xs font-black text-blue-950">
                        {formatPrice(tx.resalePrice)}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 line-clamp-1">
                      Blk {tx.block} {tx.streetName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {tx.town} &bull; {tx.storeyRange} Flr &bull; {tx.flatModel}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">${Math.round(tx.psf)}/psf</span>
                    <span className="font-bold text-blue-600">View Unit &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
};
