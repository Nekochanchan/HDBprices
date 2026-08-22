import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { HdbTransaction } from '../types';
import { formatPrice, formatPsf, formatArea, calculateMortgage } from '../utils/formatters';
import {
  Layers,
  Locate,
  Maximize2,
  Sparkles,
  MapPin,
  Train,
  School,
  Clock,
  Building2,
  Scale,
  ArrowRight,
  Calculator,
  X,
  ExternalLink,
} from 'lucide-react';
import { SINGAPORE_TOWNS } from '../data/hdbData';

interface MapViewProps {
  transactions: HdbTransaction[];
  selectedTransaction: HdbTransaction | null;
  onSelectTransaction: (tx: HdbTransaction) => void;
  onOpenDetailModal?: (tx: HdbTransaction) => void;
  onToggleCompare?: (tx: HdbTransaction) => void;
  isCompared?: (id: string) => boolean;
  unitSystem: 'sqft' | 'sqm';
  onOpenOneMapSearch?: () => void;
  onScrollToListing?: (tx: HdbTransaction) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  transactions,
  selectedTransaction,
  onSelectTransaction,
  onOpenDetailModal,
  onToggleCompare,
  isCompared,
  unitSystem,
  onOpenOneMapSearch,
  onScrollToListing,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const beaconLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const [mapStyle, setMapStyle] = useState<'onemap' | 'onemap-grey' | 'carto' | 'osm'>('onemap');
  const [viewMode, setViewMode] = useState<'pins' | 'townSummary'>('pins');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Singapore center coordinates
    const sgCenter: [number, number] = [1.3521, 103.8198];
    const map = L.map(mapContainerRef.current, {
      center: sgCenter,
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default tile layer: OneMap Singapore (SLA)
    L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
      maxZoom: 19,
      minZoom: 11,
    }).addTo(map);

    const beaconLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;
    beaconLayerRef.current = beaconLayer;

    // Handle background map click to close cards / clear selection
    map.on('click', () => {
      map.closePopup();
      if (beaconLayerRef.current) {
        beaconLayerRef.current.clearLayers();
      }
      if (onSelectTransaction) {
        onSelectTransaction(null as any);
      }
    });

    // ResizeObserver to ensure Leaflet properly re-renders tiles when container bounds change
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.onemap.gov.sg/" target="_blank">OneMap</a> &copy; Singapore Land Authority (SLA)';

    if (mapStyle === 'onemap-grey') {
      url = 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.onemap.gov.sg/" target="_blank">OneMap SLA (Grey)</a>';
    } else if (mapStyle === 'carto') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OSM contributors &copy; CARTO';
    } else if (mapStyle === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(url, {
      attribution,
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 11,
    }).addTo(map);
  }, [mapStyle]);

  // Render Markers on Data / Selection / ViewMode Change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();
    markerMapRef.current.clear();

    if (viewMode === 'townSummary') {
      // Aggregate transactions by town
      const townMap = new Map<string, { count: number; total: number; center: [number, number] }>();

      transactions.forEach((tx) => {
        const existing = townMap.get(tx.town) || {
          count: 0,
          total: 0,
          center: [tx.lat, tx.lng] as [number, number],
        };
        existing.count += 1;
        existing.total += tx.resalePrice;
        townMap.set(tx.town, existing);
      });

      townMap.forEach((data, town) => {
        const avg = Math.round(data.total / data.count);
        const townInfo = SINGAPORE_TOWNS.find((t) => t.name === town);
        const center = townInfo ? townInfo.center : data.center;

        const html = `
          <div class="hdb-cluster-pill cursor-pointer shadow-xl hover:scale-105 transition-transform" id="town-marker-${town.replace(/\s+/g, '-')}">
            <span class="text-[10px] font-bold tracking-tight text-slate-300 leading-none">${town.length > 10 ? town.slice(0, 8) + '..' : town}</span>
            <span class="text-xs font-black text-amber-300 leading-tight">${formatPrice(avg, true)}</span>
            <span class="text-[9px] bg-slate-800 text-slate-300 px-1 rounded-full mt-0.5">${data.count} units</span>
          </div>
        `;

        const clusterIcon = L.divIcon({
          className: 'hdb-cluster-marker',
          html,
          iconSize: [54, 54],
          iconAnchor: [27, 27],
        });

        const marker = L.marker(center, { icon: clusterIcon }).addTo(markersLayer);
        marker.on('click', () => {
          mapInstanceRef.current?.setView(center, 14, { animate: true });
          setViewMode('pins');
        });
      });

      return;
    }

    // Individual Price Pin Markers with Rich Customer-Oriented Popups
    transactions.forEach((tx) => {
      const isSelected = selectedTransaction?.id === tx.id;
      const isMillion = tx.resalePrice >= 1000000;
      const priceText = formatPrice(tx.resalePrice, true);
      const isItemCompared = isCompared ? isCompared(tx.id) : false;

      // Calculate estimated monthly payment (HDB concessionary 2.6%, 25-yr tenure, 20% downpayment)
      const monthlyMortgage = calculateMortgage({
        propertyPrice: tx.resalePrice,
        downpaymentPct: 20,
        interestRatePct: 2.6,
        loanTenureYears: 25,
      }).monthlyPayment;

      const html = `
        <div class="relative">
          ${isSelected ? '<div class="selected-pin-beacon"></div>' : ''}
          <div 
            id="marker-${tx.id}"
            class="hdb-price-pill ${isSelected ? 'is-active ring-4 ring-blue-400 font-extrabold' : ''} ${isMillion ? 'million-dollar' : ''}"
          >
            ${isMillion ? '<span class="text-[10px] text-amber-300">✨</span>' : ''}
            <span class="font-extrabold">${priceText}</span>
            <span class="text-[9px] font-semibold opacity-90 pl-0.5">${tx.flatType.replace(' ROOM', 'R')}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'hdb-price-marker',
        html,
        iconSize: [76, 32],
        iconAnchor: [38, 32],
      });

      const marker = L.marker([tx.lat, tx.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(markersLayer);

      markerMapRef.current.set(tx.id, marker);

      // Rich Customer-Oriented Popup Content with Apple-grade polish
      const popupContent = document.createElement('div');
      popupContent.className = 'text-slate-900 bg-white min-w-[280px] max-w-[320px] rounded-2xl overflow-hidden shadow-2xl';
      popupContent.innerHTML = `
        <!-- Image & Badges Banner -->
        <div class="relative h-24 w-full overflow-hidden bg-slate-900">
          <img 
            src="${tx.imageUrl}" 
            alt="Blk ${tx.block} ${tx.streetName}"
            class="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
            onerror="this.style.display='none'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
          
          <div class="absolute top-2.5 left-2.5 max-w-[calc(100%-48px)] flex flex-wrap gap-1 z-10">
            <span class="px-2 py-0.5 text-[10px] font-bold bg-[#0071e3] text-white rounded-full shadow-xs tracking-tight">
              ${tx.flatType}
            </span>
            <span class="px-2 py-0.5 text-[10px] font-medium bg-black/60 backdrop-blur-md text-white/95 rounded-full border border-white/15">
              ${tx.flatModel}
            </span>
            ${isMillion ? '<span class="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-full shadow-xs">✨ $1M+</span>' : ''}
          </div>
        </div>

        <!-- Main Property Content -->
        <div class="p-3.5 space-y-2.5">
          <!-- Property Title & Town -->
          <div class="pb-1.5 border-b border-black/[0.06]">
            <h4 class="font-bold text-xs sm:text-[13px] text-[#1d1d1f] tracking-tight leading-snug truncate" title="Blk ${tx.block} ${tx.streetName}">
              Blk ${tx.block} ${tx.streetName}
            </h4>
            <p class="text-[10px] text-[#86868b] mt-0.5 font-medium">
              ${tx.town} &bull; Transacted ${tx.month}
            </p>
          </div>

          <!-- Price & PSF -->
          <div class="flex items-baseline justify-between gap-2 pb-1 border-b border-black/[0.06]">
            <div>
              <span class="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Transacted Price</span>
              <span class="text-lg font-bold text-[#0071e3] tracking-tight">${formatPrice(tx.resalePrice)}</span>
            </div>
            <div class="text-right">
              <span class="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Unit PSF</span>
              <span class="text-xs font-semibold text-slate-800">${formatPsf(tx.resalePrice, tx.floorAreaSqft, unitSystem)}</span>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 gap-1.5 text-xs">
            <div class="p-1.5 bg-[#f5f5f7] rounded-xl border border-black/[0.04]">
              <span class="text-[9px] text-slate-400 block font-medium">Floor Area &amp; Level</span>
              <span class="font-semibold text-slate-850 text-[10px] sm:text-[11px]">
                ${formatArea(tx.floorAreaSqft, unitSystem)} &bull; ${tx.storeyRange} Flr
              </span>
            </div>
            <div class="p-1.5 bg-[#f5f5f7] rounded-xl border border-black/[0.04]">
              <span class="text-[9px] text-slate-400 block font-medium">Remaining Lease</span>
              <span class="font-semibold text-slate-850 text-[10px] sm:text-[11px]">
                ${tx.remainingLeaseYears.toFixed(0)} yrs (${tx.leaseCommenceDate})
              </span>
            </div>
          </div>

          <!-- Customer Proximity Highlights: MRT & School -->
          <div class="space-y-1 pt-0.5 text-xs text-slate-600">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style="background-color: ${tx.nearestMrt.lineColor}"></span>
              <span class="truncate font-semibold text-slate-800 text-[11px]">${tx.nearestMrt.name.split('(')[0]}</span>
              <span class="text-[10px] text-slate-500 font-medium ml-auto shrink-0">
                ${tx.nearestMrt.distanceMeters}m (${tx.nearestMrt.walkMins}m)
              </span>
            </div>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span class="text-emerald-600 font-bold">🏫</span>
              <span class="truncate">${tx.nearestSchool.name}</span>
              <span class="text-emerald-700 font-semibold shrink-0 ml-auto">&lt;1km P1</span>
            </div>
          </div>

          <!-- Mortgage Estimator Callout -->
          <div class="p-1.5 bg-blue-50/70 border border-blue-100/80 rounded-xl flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 text-blue-900 font-medium text-[10px]">
              <span>Est. Loan:</span>
              <strong class="font-bold text-[#0071e3]">${formatPrice(monthlyMortgage)}/mo</strong>
            </div>
            <span class="text-[9px] text-[#0071e3] font-bold">2.6% HDB</span>
          </div>

          <!-- Action Buttons (Combined Apple-style) -->
          <div class="flex items-center gap-1.5 pt-0.5">
            <button 
              id="btn-popup-inspect-${tx.id}" 
              class="flex-1 py-1.5 px-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Inspect Details</span>
              <span>&rarr;</span>
            </button>

            ${onScrollToListing ? `
              <button 
                id="btn-popup-jump-${tx.id}" 
                class="py-1.5 px-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border border-black/[0.06] font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Scroll to this flat card in the listing"
              >
                <span>Jump</span>
              </button>
            ` : ''}
            
            <button 
              id="btn-popup-compare-${tx.id}" 
              class="py-1.5 px-2.5 ${isItemCompared ? 'bg-blue-100 text-[#0071e3] border-blue-200' : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-black/[0.06]'} border font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Add to comparison"
            >
              <span>${isItemCompared ? '✓' : '+ Compare'}</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        offset: [0, -34],
        maxWidth: 320,
        minWidth: 280,
        autoPan: true,
        autoPanPaddingTopLeft: L.point(16, 24),
        autoPanPaddingBottomRight: L.point(16, 36),
        keepInView: true,
        className: 'custom-hdb-leaflet-popup',
      });

      marker.on('popupopen', () => {
        // Wire primary inspect / details button
        const inspectBtn = popupContent.querySelector(`#btn-popup-inspect-${tx.id}`);
        if (inspectBtn) {
          inspectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onOpenDetailModal) {
              onOpenDetailModal(tx);
            } else {
              onSelectTransaction(tx);
            }
          });
        }

        // Wire jump to card button
        const jumpBtn = popupContent.querySelector(`#btn-popup-jump-${tx.id}`);
        if (jumpBtn) {
          jumpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onScrollToListing) {
              onScrollToListing(tx);
            }
          });
        }

        // Wire compare button
        const compareBtn = popupContent.querySelector(`#btn-popup-compare-${tx.id}`);
        if (compareBtn) {
          compareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onToggleCompare) {
              onToggleCompare(tx);
            }
          });
        }
      });

      marker.on('click', () => {
        onSelectTransaction(tx);
        // Ensure immediate camera glide & framing even if state was previously holding this transaction
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          const containerHeight = map.getSize().y || 540;
          const offsetPixels = Math.min(135, Math.max(85, Math.round(containerHeight * 0.2)));

          const targetPoint = map.project([tx.lat, tx.lng], 16);
          const adjustedPoint = L.point(targetPoint.x, targetPoint.y - offsetPixels);
          const targetCenterLatLng = map.unproject(adjustedPoint, 16);

          map.flyTo(targetCenterLatLng, 16, {
            animate: true,
            duration: 0.55,
            easeLinearity: 0.2,
          });

          // Activate pulse radar beacon
          if (beaconLayerRef.current) {
            beaconLayerRef.current.clearLayers();
            const pulseCircle = L.circle([tx.lat, tx.lng], {
              radius: 120,
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '4, 6',
            }).addTo(beaconLayerRef.current);

            setTimeout(() => {
              if (beaconLayerRef.current?.hasLayer(pulseCircle)) {
                beaconLayerRef.current.removeLayer(pulseCircle);
              }
            }, 5000);
          }
        }
      });
    });
  }, [transactions, viewMode, onSelectTransaction, onOpenDetailModal, onToggleCompare, isCompared, unitSystem, onScrollToListing]);

  // Center on selected transaction, update beacon and open popup
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // When deselecting (null), close popups, clear beacon and remove active styling
    if (!selectedTransaction) {
      map.closePopup();
      if (beaconLayerRef.current) {
        beaconLayerRef.current.clearLayers();
      }
      document.querySelectorAll('.hdb-price-pill.is-active').forEach((el) => {
        el.classList.remove('is-active', 'ring-4', 'ring-blue-400', 'font-extrabold');
      });
      return;
    }

    // Ensure we are in pins view mode to show the pin
    if (viewMode !== 'pins') {
      setViewMode('pins');
    }

    // Update active highlight style on marker DOM without rebuilding layers
    document.querySelectorAll('.hdb-price-pill.is-active').forEach((el) => {
      el.classList.remove('is-active', 'ring-4', 'ring-blue-400', 'font-extrabold');
    });
    const activeEl = document.getElementById(`marker-${selectedTransaction.id}`);
    if (activeEl) {
      activeEl.classList.add('is-active', 'ring-4', 'ring-blue-400', 'font-extrabold');
    }

    // Fly smoothly with an Apple Maps-style vertical offset:
    // Harmoniously center the frame so the popup card above and the price pill marker below are both fully visible
    const containerHeight = map.getSize().y || 540;
    const offsetPixels = Math.min(135, Math.max(85, Math.round(containerHeight * 0.2)));

    const targetPoint = map.project([selectedTransaction.lat, selectedTransaction.lng], 16);
    const adjustedPoint = L.point(targetPoint.x, targetPoint.y - offsetPixels);
    const targetCenterLatLng = map.unproject(adjustedPoint, 16);

    map.flyTo(targetCenterLatLng, 16, {
      animate: true,
      duration: 0.55,
      easeLinearity: 0.2,
    });

    // Update beacon layer with radar circle
    if (beaconLayerRef.current) {
      beaconLayerRef.current.clearLayers();

      const pulseCircle = L.circle([selectedTransaction.lat, selectedTransaction.lng], {
        radius: 120,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 6',
      }).addTo(beaconLayerRef.current);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (beaconLayerRef.current?.hasLayer(pulseCircle)) {
          beaconLayerRef.current.removeLayer(pulseCircle);
        }
      }, 5000);
    }

    // Open popup for this marker
    const targetMarker = markerMapRef.current.get(selectedTransaction.id);
    if (targetMarker && !targetMarker.isPopupOpen()) {
      targetMarker.openPopup();
    }
  }, [selectedTransaction, viewMode]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // 1. Dismiss any open card and remove radar beacons
    map.closePopup();
    if (beaconLayerRef.current) {
      beaconLayerRef.current.clearLayers();
    }
    if (onSelectTransaction) {
      onSelectTransaction(null as any);
    }

    // 2. Set view to Singapore central overview at zoom 12 (covers Singapore edge-to-edge seamlessly)
    map.setView([1.3521, 103.8198], 12, { animate: true });
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      map.closePopup();
      if (beaconLayerRef.current) {
        beaconLayerRef.current.clearLayers();
      }
      if (onSelectTransaction) {
        onSelectTransaction(null as any);
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 14, { animate: true });
          
          if (markersLayerRef.current) {
            L.circleMarker([lat, lng], {
              radius: 8,
              fillColor: '#2563eb',
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9,
            })
              .bindTooltip('Your Location', { permanent: true, direction: 'top' })
              .addTo(markersLayerRef.current);
          }
        },
        () => {
          // Fallback to Singapore overview
          handleResetView();
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#6ba4e8] overflow-hidden" id="singapore-map-view">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls Top Right */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Layer style selector */}
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-black/[0.06] flex items-center gap-0.5">
          <button
            type="button"
            id="map-style-onemap"
            onClick={() => setMapStyle('onemap')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
              mapStyle === 'onemap'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
            title="Official SLA OneMap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>OneMap</span>
          </button>
          <button
            type="button"
            id="map-style-onemap-grey"
            onClick={() => setMapStyle('onemap-grey')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              mapStyle === 'onemap-grey'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
            title="OneMap Grey Monochrome"
          >
            Grey
          </button>
          <button
            type="button"
            id="map-style-carto"
            onClick={() => setMapStyle('carto')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              mapStyle === 'carto'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
          >
            Carto
          </button>
          <button
            type="button"
            id="map-style-osm"
            onClick={() => setMapStyle('osm')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              mapStyle === 'osm'
                ? 'bg-[#1d1d1f] text-white shadow-xs'
                : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
          >
            OSM
          </button>
        </div>

        {/* View Mode Switcher: Pins vs Town Summary */}
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-black/[0.06] flex items-center self-end">
          <button
            type="button"
            id="view-mode-pins"
            onClick={() => setViewMode('pins')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
              viewMode === 'pins'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Price Pins</span>
          </button>
          <button
            type="button"
            id="view-mode-towns"
            onClick={() => setViewMode('townSummary')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
              viewMode === 'townSummary'
                ? 'bg-[#0071e3] text-white shadow-xs'
                : 'text-[#1d1d1f] hover:bg-black/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Towns</span>
          </button>
        </div>
      </div>

      {/* Floating Map Actions Bottom Left */}
      <div className="absolute bottom-6 left-4 z-20 flex items-center gap-2">
        <button
          type="button"
          id="btn-locate-me"
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md text-[#1d1d1f] hover:bg-white text-xs font-medium rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-black/[0.06] transition-all"
          title="Find Near Me"
        >
          <Locate className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Near Me</span>
        </button>
        <button
          type="button"
          id="btn-reset-view"
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md text-[#1d1d1f] hover:bg-white text-xs font-medium rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-black/[0.06] transition-all"
          title="Reset Singapore Island View"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#86868b]" />
          <span>Fit Singapore</span>
        </button>
      </div>

      {/* Dynamic Map Legend Bottom Right */}
      <div className="hidden xl:flex absolute bottom-6 right-16 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-black/[0.06] text-xs items-center gap-3.5 text-[#1d1d1f]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1d1d1f]"></span>
          <span className="text-[#86868b]">Standard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]"></span>
          <span className="text-[#86868b]">$1M+</span>
        </div>
        <div className="flex items-center gap-1 text-[#86868b]">
          <span><strong className="text-[#1d1d1f] font-medium">{transactions.length}</strong> pins</span>
        </div>
      </div>
    </div>
  );
};
