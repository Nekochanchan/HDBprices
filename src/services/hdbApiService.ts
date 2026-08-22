import { HdbTransaction } from '../types';
import { SINGAPORE_TOWNS } from '../data/hdbData';
import { findNearestMrt } from '../data/singaporeMrt';

export const DATA_GOV_RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';
export const DATA_GOV_BASE_URL = '/api/hdb';

export interface DataGovRawRecord {
  _id: number;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string | number;
  flat_model: string;
  lease_commence_date: string | number;
  remaining_lease: string;
  resale_price: string | number;
}

export interface DataGovApiResponse {
  help?: string;
  success: boolean;
  result: {
    resource_id: string;
    fields: { type: string; id: string }[];
    records: DataGovRawRecord[];
    total?: number;
    limit?: number;
    _links?: {
      start: string;
      next: string;
    };
  };
}

export interface FetchOptions {
  limit?: number;
  offset?: number;
  q?: string;
  town?: string;
  flatType?: string;
  filters?: Record<string, string>;
  sort?: string;
}

export interface ApiFetchResult {
  transactions: HdbTransaction[];
  rawResponse: DataGovApiResponse;
  totalRecords: number;
  requestUrl: string;
  executionTimeMs: number;
  error?: string;
}

// Preset URLs requested by user
export const DATA_GOV_PRESETS = [
  {
    id: 'first-5-raw',
    label: 'First 5 Resale Transactions (Jan 2017 Onwards)',
    description: 'Initial 5 records from dataset d_8b84c4ee58e3cfc0ece0d773c8ca6abc',
    url: `${DATA_GOV_BASE_URL}?resource_id=${DATA_GOV_RESOURCE_ID}&limit=5`,
    params: { limit: 5 },
  },
  {
    id: 'tampines-4room',
    label: 'Filtered: 4-Room Flats in Tampines (5 Records)',
    description: 'filters={"town":"TAMPINES","flat_type":"4 ROOM"}',
    url: `${DATA_GOV_BASE_URL}?resource_id=${DATA_GOV_RESOURCE_ID}&limit=5&filters=%7B%22town%22%3A%22TAMPINES%22%2C%22flat_type%22%3A%224%20ROOM%22%7D`,
    params: { limit: 5, filters: { town: 'TAMPINES', flat_type: '4 ROOM' } },
  },
  {
    id: 'latest-recent-100',
    label: 'Latest 100 Island-Wide Transactions (Recent)',
    description: 'sort=month desc, _id desc & limit=100',
    url: `${DATA_GOV_BASE_URL}?resource_id=${DATA_GOV_RESOURCE_ID}&limit=100&sort=month%20desc%2C%20_id%20desc`,
    params: { limit: 100, sort: 'month desc, _id desc' },
  },
  {
    id: 'bishan-5room-latest',
    label: 'Recent 5-Room Flats in Bishan',
    description: 'filters={"town":"BISHAN","flat_type":"5 ROOM"} & limit=25',
    url: `${DATA_GOV_BASE_URL}?resource_id=${DATA_GOV_RESOURCE_ID}&limit=25&filters=%7B%22town%22%3A%22BISHAN%22%2C%22flat_type%22%3A%225%20ROOM%22%7D&sort=month%20desc`,
    params: { limit: 25, filters: { town: 'BISHAN', flat_type: '5 ROOM' }, sort: 'month desc' },
  },
];

// Curated stock photos for various HDB flat types
const PHOTO_BANK = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565402170291-8491f14678db?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
];

// Hash a string deterministically into coordinates around a town center
function hashToCoordinates(townName: string, block: string, street: string): [number, number] {
  const townObj = SINGAPORE_TOWNS.find((t) => t.name.toUpperCase() === townName.toUpperCase());
  const centerLat = townObj ? townObj.center[0] : 1.3521;
  const centerLng = townObj ? townObj.center[1] : 103.8198;

  // Simple string hash
  const str = `${townName}-${block}-${street}`;
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + char;
    hash1 |= 0;
    hash2 = (hash2 << 7) - hash2 + char * (i + 1);
    hash2 |= 0;
  }

  // Dispersion within ~1.8km radius of town center
  const offsetLat = ((Math.abs(hash1) % 1000) / 1000 - 0.5) * 0.024;
  const offsetLng = ((Math.abs(hash2) % 1000) / 1000 - 0.5) * 0.028;

  return [
    parseFloat((centerLat + offsetLat).toFixed(6)),
    parseFloat((centerLng + offsetLng).toFixed(6)),
  ];
}

// Parse remaining lease string like "61 years 04 months" or "61 years" into float years
function parseRemainingLeaseYears(leaseStr: string, commenceYear: number): number {
  if (!leaseStr) {
    const currentYear = new Date().getFullYear();
    const elapsed = Math.max(0, currentYear - commenceYear);
    return Math.max(1, 99 - elapsed);
  }

  const yearsMatch = leaseStr.match(/(\d+)\s*years?/i);
  const monthsMatch = leaseStr.match(/(\d+)\s*months?/i);

  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : 0;
  const months = monthsMatch ? parseInt(monthsMatch[1], 10) : 0;

  if (years > 0 || months > 0) {
    return parseFloat((years + months / 12).toFixed(1));
  }

  const numericOnly = parseFloat(leaseStr);
  if (!isNaN(numericOnly) && numericOnly > 0) {
    return numericOnly;
  }

  return 60;
}

// Convert Data.gov.sg raw record into our rich application HdbTransaction
export function transformDataGovRecord(record: DataGovRawRecord): HdbTransaction {
  const floorSqm = parseFloat(String(record.floor_area_sqm)) || 90;
  const floorSqft = Math.round(floorSqm * 10.7639);
  const resalePrice = parseFloat(String(record.resale_price)) || 450000;
  const commenceYear = parseInt(String(record.lease_commence_date), 10) || 1990;
  const remainingYears = parseRemainingLeaseYears(record.remaining_lease, commenceYear);
  const [lat, lng] = hashToCoordinates(record.town, record.block, record.street_name);
  const nearestMrt = findNearestMrt(lat, lng);

  const psf = Math.round(resalePrice / floorSqft);
  const psm = Math.round(resalePrice / floorSqm);

  // Pick deterministic photo
  const photoIndex = Math.abs(record._id) % PHOTO_BANK.length;
  const imageUrl = PHOTO_BANK[photoIndex];

  // Generate historical trends based on resale price
  const historicalPrices = [
    {
      month: '2024-03',
      price: Math.round(resalePrice * 0.94),
      storey: record.storey_range,
      flatType: record.flat_type,
    },
    {
      month: '2024-08',
      price: Math.round(resalePrice * 0.965),
      storey: record.storey_range,
      flatType: record.flat_type,
    },
    {
      month: '2024-11',
      price: Math.round(resalePrice * 0.985),
      storey: record.storey_range,
      flatType: record.flat_type,
    },
    {
      month: record.month || '2025-01',
      price: resalePrice,
      storey: record.storey_range,
      flatType: record.flat_type,
    },
  ];

  return {
    id: `tx-gov-${record._id}`,
    month: record.month,
    town: record.town.toUpperCase(),
    flatType: record.flat_type.toUpperCase(),
    block: record.block,
    streetName: record.street_name,
    storeyRange: record.storey_range,
    floorAreaSqm: floorSqm,
    floorAreaSqft: floorSqft,
    flatModel: record.flat_model || 'Model A',
    leaseCommenceDate: commenceYear,
    remainingLeaseYears: remainingYears,
    remainingLeaseText: record.remaining_lease || `${remainingYears} years remaining`,
    resalePrice,
    psf,
    psm,
    lat,
    lng,
    nearestMrt,
    nearestSchool: {
      name: `${record.town.charAt(0) + record.town.slice(1).toLowerCase()} Primary School`,
      distanceMeters: 250 + (Math.abs(record._id * 17) % 550),
    },
    amenities: [
      `${record.town} Central & Community Club`,
      'Hawker Centre & Wet Market',
      'Neighbourhood Park & Fitness Corner',
      'Childcare Centre',
    ],
    imageUrl,
    historicalPrices,
  };
}

// Build URL with query params
export function buildDataGovUrl(options: FetchOptions): string {
  const query = new URLSearchParams();
  query.set('resource_id', DATA_GOV_RESOURCE_ID);

  if (options.limit) {
    query.set('limit', String(options.limit));
  }
  if (options.offset) {
    query.set('offset', String(options.offset));
  }
  if (options.q) {
    query.set('q', options.q);
  }
  if (options.sort) {
    query.set('sort', options.sort);
  }

  // Combined filters
  const filters: Record<string, string> = { ...(options.filters || {}) };
  if (options.town) {
    filters.town = options.town.toUpperCase();
  }
  if (options.flatType) {
    filters.flat_type = options.flatType.toUpperCase();
  }

  if (Object.keys(filters).length > 0) {
    query.set('filters', JSON.stringify(filters));
  }

  return `${DATA_GOV_BASE_URL}?${query.toString()}`;
}

// Fetch live transactions directly from Data.gov.sg
export async function fetchDataGovTransactions(options: FetchOptions = {}): Promise<ApiFetchResult> {
  const requestUrl = buildDataGovUrl(options);
  const startTime = performance.now();

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} (${response.statusText})`);
    }

    const data: DataGovApiResponse = await response.json();
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (!data.success || !data.result) {
      throw new Error('Data.gov.sg API returned success=false');
    }

    const rawRecords = data.result.records || [];
    const transactions = rawRecords.map(transformDataGovRecord);

    return {
      transactions,
      rawResponse: data,
      totalRecords: data.result.total || rawRecords.length,
      requestUrl,
      executionTimeMs,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      transactions: [],
      rawResponse: { success: false, result: { resource_id: DATA_GOV_RESOURCE_ID, fields: [], records: [] } },
      totalRecords: 0,
      requestUrl,
      executionTimeMs,
      error: err.message || 'Failed to fetch from Data.gov.sg',
    };
  }
}
