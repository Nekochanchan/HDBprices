export interface HdbTransaction {
  id: string;
  month: string; // e.g. "2025-01"
  town: string;
  flatType: string; // "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "MULTI-GENERATION"
  block: string;
  streetName: string;
  storeyRange: string; // e.g. "10 TO 12"
  floorAreaSqm: number;
  floorAreaSqft: number;
  flatModel: string; // "Model A", "Improved", "New Generation", "Premium Apartment", "DBSS", "Maisonette", "Apartment", "Terrace", "Type S1/S2"
  leaseCommenceDate: number;
  remainingLeaseYears: number;
  remainingLeaseText: string;
  resalePrice: number;
  psf: number;
  psm: number;
  lat: number;
  lng: number;
  postalCode?: string;
  nearestMrt: {
    name: string;
    line: 'NSL' | 'EWL' | 'CCL' | 'DTL' | 'NEL' | 'TEL' | 'BPL';
    lineColor: string;
    distanceMeters: number;
    walkMins: number;
  };
  nearestSchool: {
    name: string;
    distanceMeters: number;
  };
  amenities: string[];
  imageUrl: string;
  historicalPrices: {
    month: string;
    price: number;
    storey: string;
    flatType: string;
  }[];
}

export interface FilterState {
  searchQuery: string;
  towns: string[];
  flatTypes: string[];
  minPrice: number;
  maxPrice: number;
  minSizeSqft: number;
  maxSizeSqft: number;
  minRemainingLease: number;
  maxRemainingLease: number;
  storeyCategories: string[]; // 'Low (1-6)', 'Mid (7-15)', 'High (16+)'
  flatModels: string[];
  millionDollarOnly: boolean;
  nearMrtOnly: boolean; // < 500m
  sortBy: 'date_desc' | 'price_asc' | 'price_desc' | 'psf_asc' | 'psf_desc' | 'size_desc' | 'lease_desc';
  unitSystem: 'sqft' | 'sqm';
}

export interface TownStats {
  town: string;
  region: 'Central' | 'East' | 'North' | 'North-East' | 'West';
  center: [number, number];
  totalTransactions: number;
  medianPrice: number;
  medianPsf: number;
  avgRemainingLease: number;
}
