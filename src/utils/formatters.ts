import { FilterState, HdbTransaction } from '../types';

export function formatPrice(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
    }
    return `$${Math.round(amount / 1000)}k`;
  }
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-SG').format(Math.round(value));
}

export function formatArea(valueSqft: number, unit: 'sqft' | 'sqm'): string {
  if (unit === 'sqm') {
    const sqm = Math.round(valueSqft / 10.7639);
    return `${sqm} sqm`;
  }
  return `${Math.round(valueSqft)} sqft`;
}

export function formatPsf(price: number, sizeSqft: number, unit: 'sqft' | 'sqm'): string {
  if (unit === 'sqm') {
    const psm = Math.round(price / (sizeSqft / 10.7639));
    return `$${formatNumber(psm)}/sqm`;
  }
  const psf = Math.round(price / sizeSqft);
  return `$${formatNumber(psf)}/sqft`;
}

export function filterTransactions(
  transactions: HdbTransaction[],
  filters: FilterState
): HdbTransaction[] {
  return transactions
    .filter((item) => {
      // Search query (Town, Street, Block, MRT, Flat Type)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchTown = item.town.toLowerCase().includes(query);
        const matchStreet = item.streetName.toLowerCase().includes(query);
        const matchBlock = item.block.toLowerCase().includes(query);
        const matchMrt = item.nearestMrt.name.toLowerCase().includes(query);
        const matchFlatType = item.flatType.toLowerCase().includes(query);
        const matchModel = item.flatModel.toLowerCase().includes(query);

        if (!matchTown && !matchStreet && !matchBlock && !matchMrt && !matchFlatType && !matchModel) {
          return false;
        }
      }

      // Town filter
      if (filters.towns.length > 0 && !filters.towns.includes(item.town)) {
        return false;
      }

      // Flat Type filter
      if (filters.flatTypes.length > 0 && !filters.flatTypes.includes(item.flatType)) {
        return false;
      }

      // Price range
      if (item.resalePrice < filters.minPrice || item.resalePrice > filters.maxPrice) {
        return false;
      }

      // Size range (in Sqft)
      if (item.floorAreaSqft < filters.minSizeSqft || item.floorAreaSqft > filters.maxSizeSqft) {
        return false;
      }

      // Remaining Lease (in years)
      if (
        item.remainingLeaseYears < filters.minRemainingLease ||
        item.remainingLeaseYears > filters.maxRemainingLease
      ) {
        return false;
      }

      // Storey category
      if (filters.storeyCategories.length > 0) {
        // Parse storey range e.g. "25 TO 27" -> 25
        const firstNumMatch = item.storeyRange.match(/\d+/);
        const startLevel = firstNumMatch ? parseInt(firstNumMatch[0], 10) : 1;
        
        const matchesCategory = filters.storeyCategories.some((cat) => {
          if (cat.includes('Low') && startLevel <= 6) return true;
          if (cat.includes('Mid') && startLevel >= 7 && startLevel <= 15) return true;
          if (cat.includes('High') && startLevel >= 16) return true;
          return false;
        });

        if (!matchesCategory) return false;
      }

      // Flat Model
      if (filters.flatModels.length > 0 && !filters.flatModels.includes(item.flatModel)) {
        return false;
      }

      // Million Dollar Only
      if (filters.millionDollarOnly && item.resalePrice < 1000000) {
        return false;
      }

      // Near MRT Only (< 500m)
      if (filters.nearMrtOnly && item.nearestMrt.distanceMeters > 500) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return a.resalePrice - b.resalePrice;
        case 'price_desc':
          return b.resalePrice - a.resalePrice;
        case 'psf_asc':
          return a.psf - b.psf;
        case 'psf_desc':
          return b.psf - a.psf;
        case 'size_desc':
          return b.floorAreaSqft - a.floorAreaSqft;
        case 'lease_desc':
          return b.remainingLeaseYears - a.remainingLeaseYears;
        case 'date_desc':
        default:
          return b.month.localeCompare(a.month);
      }
    });
}

// Calculate Singapore HDB Monthly Loan Repayment
export function calculateMortgage({
  propertyPrice,
  downpaymentPct,
  interestRatePct,
  loanTenureYears,
}: {
  propertyPrice: number;
  downpaymentPct: number; // e.g. 20%
  interestRatePct: number; // e.g. 2.6% (HDB) or 3.5% (Bank)
  loanTenureYears: number; // e.g. 25
}) {
  const downpaymentAmount = (propertyPrice * downpaymentPct) / 100;
  const loanAmount = propertyPrice - downpaymentAmount;
  const monthlyRate = interestRatePct / 100 / 12;
  const totalMonths = loanTenureYears * 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    downpaymentAmount: Math.round(downpaymentAmount),
    loanAmount: Math.round(loanAmount),
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    // Est minimum household income required based on 30% MSR
    minHouseholdIncome: Math.round(monthlyPayment / 0.3),
  };
}
