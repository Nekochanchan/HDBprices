import React, { useState, useEffect } from 'react';
import {
  DATA_GOV_RESOURCE_ID,
  DATA_GOV_PRESETS,
  fetchDataGovTransactions,
  ApiFetchResult,
  FetchOptions,
  buildDataGovUrl,
} from '../services/hdbApiService';
import {
  ONEMAP_PRESETS,
  searchOneMap,
  buildOneMapSearchUrl,
  OneMapFetchResult,
  OneMapSearchResult,
  OneMapQueryOptions,
} from '../services/oneMapService';
import { HdbTransaction } from '../types';
import { SINGAPORE_TOWNS, FLAT_TYPES } from '../data/hdbData';
import { formatPrice } from '../utils/formatters';
import {
  X,
  Database,
  ExternalLink,
  Play,
  Copy,
  Check,
  Code2,
  Table,
  Zap,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  MapPin,
  Compass,
  Key,
  Layers,
  Info,
} from 'lucide-react';

interface DataGovExplorerModalProps {
  onClose: () => void;
  onApplyTransactionsToApp: (transactions: HdbTransaction[], label: string) => void;
  initialService?: 'datagov' | 'onemap';
}

export const DataGovExplorerModal: React.FC<DataGovExplorerModalProps> = ({
  onClose,
  onApplyTransactionsToApp,
  initialService = 'onemap',
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

  // Service Switcher: Data.gov.sg Resale API vs OneMap SLA Search / Geocode API
  const [activeService, setActiveService] = useState<'datagov' | 'onemap'>(initialService);

  // ----------------------------------------------------
  // Data.gov.sg State
  // ----------------------------------------------------
  const [selectedDataGovPreset, setSelectedDataGovPreset] = useState<string>('first-5-raw');
  const [dataGovTab, setDataGovTab] = useState<'parsed' | 'rawJson' | 'builder'>('parsed');
  const [isDataGovLoading, setIsDataGovLoading] = useState<boolean>(false);
  const [dataGovResult, setDataGovResult] = useState<ApiFetchResult | null>(null);

  const [customLimit, setCustomLimit] = useState<number>(5);
  const [customTown, setCustomTown] = useState<string>('');
  const [customFlatType, setCustomFlatType] = useState<string>('');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [customSort, setCustomSort] = useState<string>('');

  // ----------------------------------------------------
  // OneMap (SLA) State
  // ----------------------------------------------------
  const [selectedOneMapPreset, setSelectedOneMapPreset] = useState<string>('raffles-place');
  const [oneMapTab, setOneMapTab] = useState<'results' | 'rawJson' | 'builder'>('results');
  const [isOneMapLoading, setIsOneMapLoading] = useState<boolean>(false);
  const [oneMapResult, setOneMapResult] = useState<OneMapFetchResult | null>(null);

  const [oneMapSearchVal, setOneMapSearchVal] = useState<string>('raffles place');
  const [oneMapReturnGeom, setOneMapReturnGeom] = useState<'Y' | 'N'>('Y');
  const [oneMapGetAddrDetails, setOneMapGetAddrDetails] = useState<'Y' | 'N'>('Y');
  const [oneMapPageNum, setOneMapPageNum] = useState<number>(1);
  const [oneMapAuthToken, setOneMapAuthToken] = useState<string>('');

  // Clipboard feedbacks
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // ----------------------------------------------------
  // Execution Handlers
  // ----------------------------------------------------
  const runDataGovQuery = async (options: FetchOptions) => {
    setIsDataGovLoading(true);
    try {
      const res = await fetchDataGovTransactions(options);
      setDataGovResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsDataGovLoading(false);
    }
  };

  const runOneMapQuery = async (options: OneMapQueryOptions) => {
    setIsOneMapLoading(true);
    try {
      const res = await searchOneMap(options);
      setOneMapResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsOneMapLoading(false);
    }
  };

  // Initial runs
  useEffect(() => {
    // Run OneMap default query
    runOneMapQuery({
      searchVal: 'raffles place',
      returnGeom: 'Y',
      getAddrDetails: 'Y',
      pageNum: 1,
    });

    // Run Data.gov.sg default preset
    const preset = DATA_GOV_PRESETS[0];
    runDataGovQuery(preset.params);
  }, []);

  const handleSelectDataGovPreset = (presetId: string) => {
    setSelectedDataGovPreset(presetId);
    const preset = DATA_GOV_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      runDataGovQuery(preset.params);
    }
  };

  const handleSelectOneMapPreset = (presetId: string) => {
    setSelectedOneMapPreset(presetId);
    const preset = ONEMAP_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setOneMapSearchVal(preset.searchVal);
      runOneMapQuery({
        searchVal: preset.searchVal,
        returnGeom: oneMapReturnGeom,
        getAddrDetails: oneMapGetAddrDetails,
        pageNum: oneMapPageNum,
        token: oneMapAuthToken || undefined,
      });
    }
  };

  const handleRunCustomDataGov = () => {
    const filters: Record<string, string> = {};
    if (customTown) filters.town = customTown;
    if (customFlatType) filters.flat_type = customFlatType;

    const options: FetchOptions = {
      limit: customLimit,
      q: customSearch || undefined,
      sort: customSort || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
    runDataGovQuery(options);
  };

  const handleRunCustomOneMap = () => {
    runOneMapQuery({
      searchVal: oneMapSearchVal,
      returnGeom: oneMapReturnGeom,
      getAddrDetails: oneMapGetAddrDetails,
      pageNum: oneMapPageNum,
      token: oneMapAuthToken || undefined,
    });
  };

  const handleCopy = (text: string, type: 'url' | 'json' | 'curl') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === 'json') {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const currentDataGovUrl =
    dataGovResult?.requestUrl || buildDataGovUrl({ limit: customLimit });

  const currentOneMapUrl =
    oneMapResult?.requestUrl ||
    buildOneMapSearchUrl({
      searchVal: oneMapSearchVal,
      returnGeom: oneMapReturnGeom,
      getAddrDetails: oneMapGetAddrDetails,
      pageNum: oneMapPageNum,
    });

  const oneMapCurlCommand = `curl -X GET "${currentOneMapUrl}" \\
  -H "Authorization: Bearer ${oneMapAuthToken || '<YOUR_ONEMAP_TOKEN>'}" \\
  -H "Accept: application/json"`;

  return (
    <div
      id="modal-backdrop-api-hub"
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        id="modal-card-api-hub"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden cursor-default"
      >
        {/* Header with Dual Service Badges */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Singapore Gov &amp; OneMap API Hub
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md uppercase">
                  Official Endpoints
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Live Data.gov.sg HDB Resale dataset &bull; Singapore Land Authority (SLA) OneMap Geocoding API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.onemap.gov.sg/apidocs/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span>OneMap SLA Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              id="btn-close-api-hub-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Service Selector Tabs */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center gap-3">
          <button
            type="button"
            id="tab-service-onemap"
            onClick={() => setActiveService('onemap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeService === 'onemap'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>OneMap (SLA) Geocode &amp; Search API</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700/50 text-emerald-200 font-mono">
              GET /elastic/search
            </span>
          </button>

          <button
            type="button"
            id="tab-service-datagov"
            onClick={() => setActiveService('datagov')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeService === 'datagov'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-blue-300" />
            <span>Data.gov.sg HDB Resale API</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-700/50 text-blue-200 font-mono">
              resource_id=d_8b84c4ee...
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SERVICE 1: ONEMAP (SLA) GECODING & SEARCH                                 */}
        {/* ========================================================================= */}
        {activeService === 'onemap' ? (
          <>
            {/* OneMap SLA Notice & Requirement Banner */}
            <div className="bg-emerald-950/40 border-b border-emerald-900/40 px-6 py-2.5 flex items-center justify-between gap-4 text-xs text-emerald-200">
              <div className="flex items-center gap-2 min-w-0">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-emerald-100">Official OneMap Requirement:</strong>{' '}
                  Authorization header (<code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-300 font-mono">Authorization: Bearer &lt;token&gt;</code>) is officially required by SLA for live production requests.
                </span>
              </div>
              <a
                href="https://www.onemap.gov.sg/apidocs/apidocs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:underline font-extrabold flex items-center gap-1 shrink-0 text-[11px]"
              >
                <span>Get SLA Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Presets Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>OneMap Search Presets (Click to Execute):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {ONEMAP_PRESETS.map((preset) => {
                  const isSelected = selectedOneMapPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      id={`btn-onemap-preset-${preset.id}`}
                      onClick={() => handleSelectOneMapPreset(preset.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="font-extrabold truncate">{preset.label}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400 font-mono'
                        }`}
                      >
                        {preset.searchVal}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live OneMap URL Bar */}
            <div className="bg-slate-900/95 px-6 py-2.5 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GET
                </span>
                <span className="text-xs font-mono text-emerald-300 truncate select-all">
                  {currentOneMapUrl}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-copy-onemap-url"
                  onClick={() => handleCopy(currentOneMapUrl, 'url')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  type="button"
                  id="btn-copy-onemap-curl"
                  onClick={() => handleCopy(oneMapCurlCommand, 'curl')}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Copy cURL Command"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied cURL' : 'cURL'}</span>
                </button>

                <button
                  type="button"
                  id="btn-execute-onemap-api"
                  disabled={isOneMapLoading}
                  onClick={handleRunCustomOneMap}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold shadow-sm transition-colors disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isOneMapLoading ? 'animate-spin' : ''}`} />
                  <span>{isOneMapLoading ? 'Searching...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            {/* View Subtabs */}
            <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOneMapTab('results')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                    oneMapTab === 'results'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Geocoded Addresses ({oneMapResult?.results.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOneMapTab('rawJson')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                    oneMapTab === 'rawJson'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw JSON Response</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOneMapTab('builder')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                    oneMapTab === 'builder'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Query Builder &amp; Auth</span>
                </button>
              </div>

              {/* Status / Timing */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
                {oneMapResult?.executionTimeMs !== undefined && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{oneMapResult.executionTimeMs} ms</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold text-slate-700">Status 200 OK</span>
                </div>
              </div>
            </div>

            {/* OneMap Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {isOneMapLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold">Querying OneMap SLA Elastic Search API...</p>
                </div>
              ) : oneMapTab === 'results' ? (
                <div>
                  {oneMapResult?.results && oneMapResult.results.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          OneMap found {oneMapResult.results.length} official location matches:
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {oneMapResult.results.map((loc, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="text-xs font-extrabold text-slate-900">
                                  {loc.SEARCHVAL}
                                </span>
                                {loc.POSTAL && (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded-md">
                                    S({loc.POSTAL})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mb-3">{loc.ADDRESS}</p>
                            </div>

                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <div className="font-mono text-slate-500 text-[10px] space-y-0.5">
                                <div>
                                  <strong className="text-slate-700">WGS84:</strong> {Number(loc.LATITUDE).toFixed(5)}, {Number(loc.LONGITUDE).toFixed(5)}
                                </div>
                                <div>
                                  <strong className="text-slate-700">SVY21:</strong> X:{loc.X.split('.')[0]} Y:{loc.Y.split('.')[0]}
                                </div>
                              </div>

                              <a
                                href={`https://www.onemap.gov.sg/main/v2/?lat=${loc.LATITUDE}&lng=${loc.LONGITUDE}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>Open OneMap</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="font-bold">No OneMap results found</p>
                      <p className="text-xs text-slate-400 mt-1">Try another search term like "raffles place" or "tampines"</p>
                    </div>
                  )}
                </div>
              ) : oneMapTab === 'rawJson' ? (
                <div className="relative">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(oneMapResult?.rawResponse, null, 2), 'json')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md transition-colors"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 text-emerald-300 rounded-2xl overflow-x-auto text-xs font-mono max-h-[480px] shadow-inner leading-relaxed">
                    {oneMapResult?.rawResponse
                      ? JSON.stringify(oneMapResult.rawResponse, null, 2)
                      : '// No OneMap response loaded yet'}
                  </pre>
                </div>
              ) : (
                /* OneMap Query Builder & Auth Config */
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                      Customize OneMap Elastic Search Request
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure parameters for Singapore Land Authority's address and geocoding engine.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* searchVal */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Search Value (searchVal) *
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={oneMapSearchVal}
                          onChange={(e) => setOneMapSearchVal(e.target.value)}
                          placeholder="e.g. raffles place, 306 tampines, orchard mrt"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Page Num */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Page Number (pageNum)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={oneMapPageNum}
                        onChange={(e) => setOneMapPageNum(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* returnGeom */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Return Geometry (returnGeom)
                      </label>
                      <select
                        value={oneMapReturnGeom}
                        onChange={(e) => setOneMapReturnGeom(e.target.value as 'Y' | 'N')}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Y">Y (Include SVY21 &amp; WGS84 Coords)</option>
                        <option value="N">N (Address Only)</option>
                      </select>
                    </div>

                    {/* getAddrDetails */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Get Address Details (getAddrDetails)
                      </label>
                      <select
                        value={oneMapGetAddrDetails}
                        onChange={(e) => setOneMapGetAddrDetails(e.target.value as 'Y' | 'N')}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Y">Y (Full Block, Road, Building)</option>
                        <option value="N">N</option>
                      </select>
                    </div>

                    {/* Optional Token Header */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-500" />
                        <span>SLA Token (Authorization: Bearer)</span>
                      </label>
                      <input
                        type="password"
                        value={oneMapAuthToken}
                        onChange={(e) => setOneMapAuthToken(e.target.value)}
                        placeholder="Optional SLA Bearer Token"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      id="btn-run-custom-onemap"
                      onClick={handleRunCustomOneMap}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute OneMap SLA Request</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* SERVICE 2: DATA.GOV.SG RESALE TRANSACTIONS                               */
          /* ========================================================================= */
          <>
            {/* Preset Selector Banner */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Select Data.gov.sg Query Presets:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {DATA_GOV_PRESETS.map((preset) => {
                  const isSelected = selectedDataGovPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      id={`btn-datagov-preset-${preset.id}`}
                      onClick={() => handleSelectDataGovPreset(preset.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="font-extrabold truncate">{preset.label}</div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-slate-400 font-mono'
                        }`}
                      >
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live URL Endpoint Box */}
            <div className="bg-slate-900/95 px-6 py-2.5 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  GET
                </span>
                <span className="text-xs font-mono text-emerald-400 truncate select-all">
                  {currentDataGovUrl}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-copy-datagov-url"
                  onClick={() => handleCopy(currentDataGovUrl, 'url')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  type="button"
                  id="btn-execute-datagov-api"
                  disabled={isDataGovLoading}
                  onClick={() => {
                    if (dataGovTab === 'builder') {
                      handleRunCustomDataGov();
                    } else {
                      const preset = DATA_GOV_PRESETS.find((p) => p.id === selectedDataGovPreset);
                      if (preset) runDataGovQuery(preset.params);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold shadow-sm transition-colors disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isDataGovLoading ? 'animate-spin' : ''}`} />
                  <span>{isDataGovLoading ? 'Fetching...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            {/* View Tabs & Metrics Bar */}
            <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDataGovTab('parsed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                    dataGovTab === 'parsed'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Transacted Units ({dataGovResult?.transactions.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDataGovTab('rawJson')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                    dataGovTab === 'rawJson'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw JSON Response</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDataGovTab('builder')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors ${
                    dataGovTab === 'builder'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Custom Query Builder</span>
                </button>
              </div>

              {/* Execution Metric Badges */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
                {dataGovResult?.executionTimeMs !== undefined && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dataGovResult.executionTimeMs} ms</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold text-slate-700">Status 200 OK</span>
                </div>
              </div>
            </div>

            {/* DataGov Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              {isDataGovLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold">Querying Data.gov.sg API endpoint in real time...</p>
                </div>
              ) : dataGovTab === 'parsed' ? (
                <div>
                  {dataGovResult?.transactions && dataGovResult.transactions.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700">
                          Returned {dataGovResult.transactions.length} transacted records parsed &amp; geocoded:
                        </span>
                        <button
                          type="button"
                          id="btn-apply-results-to-app"
                          onClick={() => {
                            if (dataGovResult?.transactions) {
                              const currentPreset = DATA_GOV_PRESETS.find(
                                (p) => p.id === selectedDataGovPreset
                              );
                              onApplyTransactionsToApp(
                                dataGovResult.transactions,
                                currentPreset ? currentPreset.label : 'Data.gov.sg Query'
                              );
                              onClose();
                            }
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Load into Main Map &amp; App</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Month</th>
                              <th className="py-2.5 px-3">Town</th>
                              <th className="py-2.5 px-3">Flat Type</th>
                              <th className="py-2.5 px-3">Block / Street</th>
                              <th className="py-2.5 px-3">Storey</th>
                              <th className="py-2.5 px-3">Area (sqm/sqft)</th>
                              <th className="py-2.5 px-3">Remaining Lease</th>
                              <th className="py-2.5 px-3">Resale Price</th>
                              <th className="py-2.5 px-3">Nearest MRT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dataGovResult.transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                                  {tx.month}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{tx.town}</td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[11px]">
                                    {tx.flatType}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">
                                  Blk {tx.block} {tx.streetName}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 font-medium">{tx.storeyRange}</td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {tx.floorAreaSqm} sqm{' '}
                                  <span className="text-slate-400">({tx.floorAreaSqft} sqft)</span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                  {tx.remainingLeaseText}
                                </td>
                                <td className="py-2.5 px-3 font-extrabold text-blue-600 text-sm">
                                  {formatPrice(tx.resalePrice)}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                                  <div className="flex items-center gap-1 font-medium">
                                    <span
                                      className="w-2 h-2 rounded-full inline-block"
                                      style={{ backgroundColor: tx.nearestMrt.lineColor }}
                                    />
                                    <span className="truncate max-w-[140px]">
                                      {tx.nearestMrt.name.split('(')[0]}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                      <p className="font-bold">No records returned for this query</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting the filter parameters</p>
                    </div>
                  )}
                </div>
              ) : dataGovTab === 'rawJson' ? (
                <div className="relative">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(dataGovResult?.rawResponse, null, 2), 'json')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md transition-colors"
                    >
                      {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl overflow-x-auto text-xs font-mono max-h-[480px] shadow-inner leading-relaxed">
                    {dataGovResult?.rawResponse
                      ? JSON.stringify(dataGovResult.rawResponse, null, 2)
                      : '// No data loaded yet'}
                  </pre>
                </div>
              ) : (
                /* Custom DataGov Query Builder */
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                      Build Custom Data.gov.sg API Request
                    </h3>
                    <p className="text-xs text-slate-500">
                      Compose queries with town filters, flat types, limit count, search strings, and sorting.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Town Filter */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Town (Filter)
                      </label>
                      <select
                        value={customTown}
                        onChange={(e) => setCustomTown(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">All Towns</option>
                        {SINGAPORE_TOWNS.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Flat Type Filter */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Flat Type (Filter)
                      </label>
                      <select
                        value={customFlatType}
                        onChange={(e) => setCustomFlatType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">All Flat Types</option>
                        {FLAT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Limit */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Limit (Records to fetch)
                      </label>
                      <select
                        value={customLimit}
                        onChange={(e) => setCustomLimit(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value={5}>5 records (Quick)</option>
                        <option value={10}>10 records</option>
                        <option value={25}>25 records</option>
                        <option value={50}>50 records</option>
                        <option value={100}>100 records</option>
                        <option value={200}>200 records</option>
                      </select>
                    </div>

                    {/* Text Search q */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Full Text Search (q)
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={customSearch}
                          onChange={(e) => setCustomSearch(e.target.value)}
                          placeholder="e.g. Tampines, 306, Bedok South"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Sort Order</label>
                      <select
                        value={customSort}
                        onChange={(e) => setCustomSort(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Default dataset order (2017 onwards)</option>
                        <option value="month desc, _id desc">Latest Month (Recent 2026/2025)</option>
                        <option value="resale_price desc">Resale Price: High to Low</option>
                        <option value="resale_price asc">Resale Price: Low to High</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      id="btn-run-custom-builder"
                      onClick={handleRunCustomDataGov}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute Custom Data.gov.sg Request</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {activeService === 'onemap' ? (
              <>
                Map Engine: <strong className="text-slate-800">Singapore Land Authority (SLA) OneMap</strong> &bull; Authoritative SG Cadastral Data
              </>
            ) : (
              <>
                Dataset: <strong className="text-slate-800">HDB Resale Flat Prices (Jan 2017 onwards)</strong> &bull; Updated Daily
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Close
            </button>
            {activeService === 'datagov' && dataGovResult?.transactions && dataGovResult.transactions.length > 0 && (
              <button
                type="button"
                id="btn-footer-apply-to-app"
                onClick={() => {
                  const currentPreset = DATA_GOV_PRESETS.find(
                    (p) => p.id === selectedDataGovPreset
                  );
                  onApplyTransactionsToApp(
                    dataGovResult.transactions,
                    currentPreset ? currentPreset.label : 'Data.gov.sg Query'
                  );
                  onClose();
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Apply {dataGovResult.transactions.length} Records to Explorer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
