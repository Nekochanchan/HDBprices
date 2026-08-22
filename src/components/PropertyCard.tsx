import React from 'react';
import { HdbTransaction } from '../types';
import { formatPrice, formatPsf, formatArea } from '../utils/formatters';
import { Building2, Clock, Train, Scale, ArrowUpRight, MapPin } from 'lucide-react';

interface PropertyCardProps {
  transaction: HdbTransaction;
  isSelected: boolean;
  isCompared: boolean;
  unitSystem: 'sqft' | 'sqm';
  onSelect: (tx: HdbTransaction) => void;
  onOpenDetail: (tx: HdbTransaction) => void;
  onToggleCompare: (tx: HdbTransaction) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  transaction,
  isSelected,
  isCompared,
  unitSystem,
  onSelect,
  onOpenDetail,
  onToggleCompare,
}) => {
  const isMillion = transaction.resalePrice >= 1000000;
  const isNearMrt = transaction.nearestMrt.distanceMeters <= 500;

  return (
    <div
      id={`property-card-${transaction.id}`}
      onClick={() => onSelect(transaction)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        isSelected
          ? 'border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-md'
          : 'border-black/[0.05] hover:border-black/[0.12] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
      }`}
    >
      {/* Top Media & Tags */}
      <div 
        className="relative h-40 w-full overflow-hidden bg-[#f5f5f7] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail(transaction);
        }}
      >
        <img
          src={transaction.imageUrl}
          alt={`Blk ${transaction.block} ${transaction.streetName}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-0.5 text-[11px] font-medium bg-white/90 backdrop-blur-md text-[#1d1d1f] rounded-full shadow-xs">
            {transaction.flatType}
          </span>
          {isMillion && (
            <span className="px-2.5 py-0.5 text-[11px] font-medium bg-[#1d1d1f]/80 backdrop-blur-md text-white rounded-full">
              $1M+
            </span>
          )}
        </div>

        {/* Compare Button */}
        <button
          type="button"
          id={`btn-compare-${transaction.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(transaction);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full text-xs backdrop-blur-md transition-all ${
            isCompared
              ? 'bg-[#0071e3] text-white shadow-xs'
              : 'bg-white/80 text-[#1d1d1f] hover:bg-white'
          }`}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
        >
          <Scale className="w-3.5 h-3.5" />
        </button>

        {/* Bottom overlay in image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-medium tracking-tight drop-shadow-xs">
            {transaction.town}
          </span>
          <span className="text-[11px] text-white/90 font-light backdrop-blur-xs">
            {transaction.month}
          </span>
        </div>
      </div>

      {/* Main Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & PSF */}
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
              {formatPrice(transaction.resalePrice)}
            </h3>
            <span className="text-xs text-[#86868b] font-medium">
              {formatPsf(transaction.resalePrice, transaction.floorAreaSqft, unitSystem)}
            </span>
          </div>

          {/* Address */}
          <p className="text-xs font-medium text-[#86868b] mt-0.5 truncate">
            Blk {transaction.block} {transaction.streetName}
          </p>

          {/* Key Specs */}
          <div className="flex items-center gap-3 mt-3 text-xs text-[#1d1d1f]">
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#86868b]" />
              <span>{formatArea(transaction.floorAreaSqft, unitSystem)}</span>
            </div>
            <span className="text-black/10">·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#86868b]" />
              <span>{transaction.remainingLeaseYears.toFixed(0)}y lease</span>
            </div>
            <span className="text-black/10">·</span>
            <span>{transaction.storeyRange} Flr</span>
          </div>

          {/* MRT Proximity */}
          <div className="mt-2.5 pt-2.5 border-t border-black/[0.04] flex items-center gap-1.5 text-xs text-[#86868b]">
            <Train className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
            <span className="truncate">
              {transaction.nearestMrt.name.split('(')[0]} ·{' '}
              <strong className="text-[#1d1d1f] font-medium">{transaction.nearestMrt.distanceMeters}m</strong>
            </span>
            {isNearMrt && (
              <span className="ml-auto text-[10px] text-[#0071e3] font-medium">
                &lt;500m
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-2.5 border-t border-black/[0.04] flex items-center justify-between gap-2">
          <button
            type="button"
            id={`btn-locate-card-${transaction.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(transaction);
            }}
            className="flex items-center gap-1 text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          <button
            type="button"
            id={`btn-detail-card-${transaction.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(transaction);
            }}
            className="flex items-center gap-0.5 text-xs font-medium text-[#0071e3] hover:underline"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

