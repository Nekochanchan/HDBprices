export interface MrtStation {
  name: string;
  code: string;
  line: 'NSL' | 'EWL' | 'CCL' | 'DTL' | 'NEL' | 'TEL' | 'BPL';
  lineColor: string;
  lat: number;
  lng: number;
}

export const SINGAPORE_MRT_STATIONS: MrtStation[] = [
  // NSL
  { name: 'Jurong East', code: 'NS1/EW24', line: 'NSL', lineColor: '#d42e12', lat: 1.3331, lng: 103.7423 },
  { name: 'Bukit Batok', code: 'NS2', line: 'NSL', lineColor: '#d42e12', lat: 1.3490, lng: 103.7496 },
  { name: 'Bukit Gombak', code: 'NS3', line: 'NSL', lineColor: '#d42e12', lat: 1.3586, lng: 103.7519 },
  { name: 'Choa Chu Kang', code: 'NS4/BP1', line: 'NSL', lineColor: '#d42e12', lat: 1.3853, lng: 103.7443 },
  { name: 'Yew Tee', code: 'NS5', line: 'NSL', lineColor: '#d42e12', lat: 1.3975, lng: 103.7474 },
  { name: 'Kranji', code: 'NS7', line: 'NSL', lineColor: '#d42e12', lat: 1.4251, lng: 103.7621 },
  { name: 'Marsiling', code: 'NS8', line: 'NSL', lineColor: '#d42e12', lat: 1.4326, lng: 103.7743 },
  { name: 'Woodlands', code: 'NS9/TE2', line: 'NSL', lineColor: '#d42e12', lat: 1.4368, lng: 103.7865 },
  { name: 'Admiralty', code: 'NS10', line: 'NSL', lineColor: '#d42e12', lat: 1.4406, lng: 103.8010 },
  { name: 'Sembawang', code: 'NS11', line: 'NSL', lineColor: '#d42e12', lat: 1.4490, lng: 103.8201 },
  { name: 'Canberra', code: 'NS12', line: 'NSL', lineColor: '#d42e12', lat: 1.4431, lng: 103.8297 },
  { name: 'Yishun', code: 'NS13', line: 'NSL', lineColor: '#d42e12', lat: 1.4294, lng: 103.8350 },
  { name: 'Khatib', code: 'NS14', line: 'NSL', lineColor: '#d42e12', lat: 1.4173, lng: 103.8329 },
  { name: 'Yio Chu Kang', code: 'NS15', line: 'NSL', lineColor: '#d42e12', lat: 1.3817, lng: 103.8449 },
  { name: 'Ang Mo Kio', code: 'NS16', line: 'NSL', lineColor: '#d42e12', lat: 1.3699, lng: 103.8496 },
  { name: 'Bishan', code: 'NS17/CC15', line: 'NSL', lineColor: '#d42e12', lat: 1.3508, lng: 103.8481 },
  { name: 'Braddell', code: 'NS18', line: 'NSL', lineColor: '#d42e12', lat: 1.3405, lng: 103.8468 },
  { name: 'Toa Payoh', code: 'NS19', line: 'NSL', lineColor: '#d42e12', lat: 1.3326, lng: 103.8476 },
  { name: 'Novena', code: 'NS20', line: 'NSL', lineColor: '#d42e12', lat: 1.3204, lng: 103.8438 },
  { name: 'Newton', code: 'NS21/DT11', line: 'NSL', lineColor: '#d42e12', lat: 1.3123, lng: 103.8380 },
  { name: 'Orchard', code: 'NS22/TE14', line: 'NSL', lineColor: '#d42e12', lat: 1.3040, lng: 103.8318 },
  { name: 'Somerset', code: 'NS23', line: 'NSL', lineColor: '#d42e12', lat: 1.3002, lng: 103.8390 },
  { name: 'Dhoby Ghaut', code: 'NS24/NE6/CC1', line: 'NSL', lineColor: '#d42e12', lat: 1.2989, lng: 103.8459 },
  { name: 'City Hall', code: 'NS25/EW13', line: 'NSL', lineColor: '#d42e12', lat: 1.2931, lng: 103.8522 },
  { name: 'Raffles Place', code: 'NS26/EW14', line: 'NSL', lineColor: '#d42e12', lat: 1.2830, lng: 103.8513 },
  { name: 'Marina Bay', code: 'NS27/CE2/TE20', line: 'NSL', lineColor: '#d42e12', lat: 1.2764, lng: 103.8546 },

  // EWL
  { name: 'Pasir Ris', code: 'EW1', line: 'EWL', lineColor: '#009645', lat: 1.3730, lng: 103.9493 },
  { name: 'Tampines', code: 'EW2/DT32', line: 'EWL', lineColor: '#009645', lat: 1.3533, lng: 103.9452 },
  { name: 'Tampines East', code: 'DT33', line: 'DTL', lineColor: '#005ec4', lat: 1.3562, lng: 103.9546 },
  { name: 'Tampines West', code: 'DT31', line: 'DTL', lineColor: '#005ec4', lat: 1.3455, lng: 103.9384 },
  { name: 'Simei', code: 'EW3', line: 'EWL', lineColor: '#009645', lat: 1.3432, lng: 103.9533 },
  { name: 'Tanah Merah', code: 'EW4', line: 'EWL', lineColor: '#009645', lat: 1.3273, lng: 103.9463 },
  { name: 'Bedok', code: 'EW5', line: 'EWL', lineColor: '#009645', lat: 1.3240, lng: 103.9300 },
  { name: 'Kembangan', code: 'EW6', line: 'EWL', lineColor: '#009645', lat: 1.3210, lng: 103.9129 },
  { name: 'Eunos', code: 'EW7', line: 'EWL', lineColor: '#009645', lat: 1.3197, lng: 103.9030 },
  { name: 'Paya Lebar', code: 'EW8/CC9', line: 'EWL', lineColor: '#009645', lat: 1.3182, lng: 103.8924 },
  { name: 'Aljunied', code: 'EW9', line: 'EWL', lineColor: '#009645', lat: 1.3164, lng: 103.8829 },
  { name: 'Kallang', code: 'EW10', line: 'EWL', lineColor: '#009645', lat: 1.3115, lng: 103.8714 },
  { name: 'Lavender', code: 'EW11', line: 'EWL', lineColor: '#009645', lat: 1.3074, lng: 103.8630 },
  { name: 'Bugis', code: 'EW12/DT14', line: 'EWL', lineColor: '#009645', lat: 1.3005, lng: 103.8560 },
  { name: 'Tanjong Pagar', code: 'EW15', line: 'EWL', lineColor: '#009645', lat: 1.2764, lng: 103.8457 },
  { name: 'Outram Park', code: 'EW16/NE3/TE17', line: 'TEL', lineColor: '#9D5B25', lat: 1.2803, lng: 103.8395 },
  { name: 'Tiong Bahru', code: 'EW17', line: 'EWL', lineColor: '#009645', lat: 1.2865, lng: 103.8269 },
  { name: 'Redhill', code: 'EW18', line: 'EWL', lineColor: '#009645', lat: 1.2896, lng: 103.8168 },
  { name: 'Queenstown', code: 'EW19', line: 'EWL', lineColor: '#009645', lat: 1.2946, lng: 103.8061 },
  { name: 'Commonwealth', code: 'EW20', line: 'EWL', lineColor: '#009645', lat: 1.3025, lng: 103.7983 },
  { name: 'Buona Vista', code: 'EW21/CC22', line: 'EWL', lineColor: '#009645', lat: 1.3073, lng: 103.7900 },
  { name: 'Dover', code: 'EW22', line: 'EWL', lineColor: '#009645', lat: 1.3114, lng: 103.7786 },
  { name: 'Clementi', code: 'EW23', line: 'EWL', lineColor: '#009645', lat: 1.3152, lng: 103.7652 },
  { name: 'Chinese Garden', code: 'EW25', line: 'EWL', lineColor: '#009645', lat: 1.3424, lng: 103.7326 },
  { name: 'Lakeside', code: 'EW26', line: 'EWL', lineColor: '#009645', lat: 1.3442, lng: 103.7209 },
  { name: 'Boon Lay', code: 'EW27', line: 'EWL', lineColor: '#009645', lat: 1.3386, lng: 103.7060 },
  { name: 'Pioneer', code: 'EW28', line: 'EWL', lineColor: '#009645', lat: 1.3376, lng: 103.6973 },

  // NEL
  { name: 'HarbourFront', code: 'NE1/CC29', line: 'NEL', lineColor: '#8f4199', lat: 1.2653, lng: 103.8224 },
  { name: 'Chinatown', code: 'NE4/DT19', line: 'NEL', lineColor: '#8f4199', lat: 1.2844, lng: 103.8440 },
  { name: 'Farrer Park', code: 'NE8', line: 'NEL', lineColor: '#8f4199', lat: 1.3125, lng: 103.8543 },
  { name: 'Boon Keng', code: 'NE9', line: 'NEL', lineColor: '#8f4199', lat: 1.3194, lng: 103.8617 },
  { name: 'Potong Pasir', code: 'NE10', line: 'NEL', lineColor: '#8f4199', lat: 1.3314, lng: 103.8691 },
  { name: 'Woodleigh', code: 'NE11', line: 'NEL', lineColor: '#8f4199', lat: 1.3392, lng: 103.8708 },
  { name: 'Serangoon', code: 'NE12/CC13', line: 'NEL', lineColor: '#8f4199', lat: 1.3498, lng: 103.8736 },
  { name: 'Kovan', code: 'NE13', line: 'NEL', lineColor: '#8f4199', lat: 1.3601, lng: 103.8850 },
  { name: 'Hougang', code: 'NE14', line: 'NEL', lineColor: '#8f4199', lat: 1.3713, lng: 103.8924 },
  { name: 'Buangkok', code: 'NE15', line: 'NEL', lineColor: '#8f4199', lat: 1.3829, lng: 103.8931 },
  { name: 'Sengkang', code: 'NE16', line: 'NEL', lineColor: '#8f4199', lat: 1.3916, lng: 103.8955 },
  { name: 'Punggol', code: 'NE17/CP4', line: 'NEL', lineColor: '#8f4199', lat: 1.4052, lng: 103.9023 },

  // DTL & TEL Highlights
  { name: 'Beauty World', code: 'DT5', line: 'DTL', lineColor: '#005ec4', lat: 1.3418, lng: 103.7758 },
  { name: 'Hillview', code: 'DT3', line: 'DTL', lineColor: '#005ec4', lat: 1.3629, lng: 103.7674 },
  { name: 'Bukit Panjang', code: 'DT1/BP6', line: 'DTL', lineColor: '#005ec4', lat: 1.3790, lng: 103.7618 },
  { name: 'MacPherson', code: 'DT26/CC10', line: 'DTL', lineColor: '#005ec4', lat: 1.3262, lng: 103.8899 },
  { name: 'Geylang Bahru', code: 'DT24', line: 'DTL', lineColor: '#005ec4', lat: 1.3214, lng: 103.8715 },
  { name: 'Marine Parade', code: 'TE26', line: 'TEL', lineColor: '#9D5B25', lat: 1.3028, lng: 103.9056 },
  { name: 'Mayflower', code: 'TE6', line: 'TEL', lineColor: '#9D5B25', lat: 1.3695, lng: 103.8364 },
  { name: 'Lentor', code: 'TE5', line: 'TEL', lineColor: '#9D5B25', lat: 1.3854, lng: 103.8359 },
  { name: 'Woodlands South', code: 'TE3', line: 'TEL', lineColor: '#9D5B25', lat: 1.4274, lng: 103.7891 },
];

export function findNearestMrt(lat: number, lng: number): {
  name: string;
  line: 'NSL' | 'EWL' | 'CCL' | 'DTL' | 'NEL' | 'TEL' | 'BPL';
  lineColor: string;
  distanceMeters: number;
  walkMins: number;
} {
  let closest = SINGAPORE_MRT_STATIONS[0];
  let minDistance = Infinity;

  for (const station of SINGAPORE_MRT_STATIONS) {
    // Haversine distance
    const dLat = (station.lat - lat) * (Math.PI / 180);
    const dLng = (station.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(station.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = Math.round(6371000 * c);

    if (distanceMeters < minDistance) {
      minDistance = distanceMeters;
      closest = station;
    }
  }

  const walkMins = Math.max(1, Math.round(minDistance / 75)); // ~75m per min walk speed

  return {
    name: `${closest.name} MRT (${closest.code})`,
    line: closest.line,
    lineColor: closest.lineColor,
    distanceMeters: minDistance,
    walkMins,
  };
}
