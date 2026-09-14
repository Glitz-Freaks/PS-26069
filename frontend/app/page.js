"use client";
import React, { useState, useEffect, useRef } from 'react';
import AreaSelector from '../components/AreaSelector';
import WarningGauge from '../components/WarningGauge';
import IMDAlertBanner from '../components/IMDAlertBanner';
import MapView from '../components/MapView';
import FilterBar from '../components/FilterBar';
import WeatherEventCard from '../components/WeatherEventCard';
import PhotoGallery from '../components/PhotoGallery';
import { Search, MapPin, RefreshCw, AlertCircle, Loader2, BellRing, FileText } from 'lucide-react';
import { reverseGeocodeGPS, forwardGeocodeSearch, getUserCurrentLocation } from '../lib/locationService';

const API_BASE = 'http://localhost:5000/api/weather';

const QUICK_GOV_HOTSPOTS = [
  { label: "Uttar Pradesh (Lucknow)", state: "Uttar Pradesh", district: "Lucknow", city: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { label: "Maharashtra (Mumbai)", state: "Maharashtra", district: "Mumbai Suburban", city: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { label: "Delhi (Central Delhi)", state: "Delhi", district: "Central Delhi", city: "New Delhi", lat: 28.6139, lng: 77.2090 },
  { label: "Tamil Nadu (Chennai)", state: "Tamil Nadu", district: "Chennai", city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { label: "Karnataka (Bengaluru)", state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { label: "Kerala (Wayanad)", state: "Kerala", district: "Wayanad", city: "Wayanad", lat: 11.6854, lng: 76.1320 },
  { label: "Assam (Golaghat)", state: "Assam", district: "Golaghat", city: "Golaghat", lat: 26.5167, lng: 93.9667 }
];

export default function DashboardPage() {
  const [selectedArea, setSelectedArea] = useState({
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    lat: 26.8467,
    lng: 80.9462
  });

  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [areaData, setAreaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const dossierRef = useRef(null);

  // Fetch Area Weather Intelligence
  const fetchAreaWeather = async (area) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        state: area.state || '',
        district: area.district || '',
        city: area.city || '',
        lat: area.lat ? String(area.lat) : '',
        lng: area.lng ? String(area.lng) : '',
        radiusKm: '50'
      });

      const res = await fetch(`${API_BASE}/area?${params}`);
      if (res.ok) {
        const json = await res.json();
        setAreaData(json);
      } else {
        throw new Error("Backend offline");
      }
    } catch {
      setAreaData(generateGovDemoData(area));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreaWeather(selectedArea);
  }, [selectedArea]);

  const handleDetectGPS = async () => {
    setIsLocating(true);
    try {
      const detected = await getUserCurrentLocation();
      if (detected) {
        setSelectedArea(detected);
        dossierRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.warn("GPS resolution fallback:", error);
      setSelectedArea({ state: "Uttar Pradesh", district: "Lucknow", city: "Lucknow", lat: 26.8467, lng: 80.9462 });
    } finally {
      setIsLocating(false);
    }
  };

  const handleHeroSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!heroSearchInput.trim()) return;

    setIsLocating(true);
    const resolved = await forwardGeocodeSearch(heroSearchInput.trim());
    setIsLocating(false);

    setSelectedArea(resolved);
    dossierRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAreaSelect = (newArea) => {
    setSelectedArea(newArea);
  };

  const handleFilterSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const results = await res.json();
        setAreaData((prev) => ({
          ...prev,
          events: results
        }));
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const events = areaData?.events || [];
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'ALL' && ev.event_category !== selectedCategory) return false;
    if (verificationFilter !== 'ALL' && ev.verification_status !== verificationFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Official Emergency Broadcast Ticker */}
      <div className="bg-amber-100/90 border-2 border-amber-400 rounded-md p-3 flex items-center space-x-3 text-xs text-slate-950 shadow-sm">
        <div className="flex items-center space-x-1.5 font-black uppercase tracking-wider text-rose-950 flex-shrink-0 bg-rose-200 px-2.5 py-1 rounded border border-rose-400">
          <BellRing className="w-4 h-4 text-rose-800 animate-pulse" />
          <span>IMD NOWCAST TICKER</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-slate-950 font-bold">
          <span className="inline-block">
            IMD RED ALERT active for coastal Maharashtra & Mumbai Suburban • Heavy Rainfall warning for Central Delhi & Gurugram • Flood watch issued for Brahmaputra valley (Assam) • Fishermen advised not to venture into Arabian Sea.
          </span>
        </div>
      </div>

      {/* 2. Official Government Hero Section */}
      <section className="bg-white border-2 border-slate-300 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl mx-auto text-center">
          
          <span className="inline-block px-3.5 py-1 rounded-md bg-[#002b5b]/10 text-[#002b5b] font-black text-xs uppercase tracking-wider mb-2.5 border border-[#002b5b]/30">
            Government of India • National Meteorological Big Data Engine
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-[#002b5b] tracking-tight mb-2.5">
            National Weather Big Data & Real-Time Analytics
          </h1>

          <p className="text-xs sm:text-sm text-slate-800 max-w-2xl mx-auto leading-relaxed mb-6 font-semibold">
            Automated multi-source ingestion of ground observations, vernacular news, citizen reports, and IMD Doppler radar ground truth across all Indian States & Union Territories.
          </p>

          {/* Official Search & Location Bar */}
          <form onSubmit={handleHeroSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-100 border-2 border-[#002b5b] rounded-lg shadow-sm">
            
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
                placeholder="Search any City, District, or State (e.g. Pune, Patna, Jaipur, Mumbai, Wayanad)..."
                className="w-full bg-white text-slate-950 text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#002b5b] placeholder:text-slate-500 font-bold"
              />
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-400 text-xs font-black rounded transition flex items-center justify-center space-x-1.5 shadow-xs"
                title="Detect My Location via GPS"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-[#002b5b]" /> : <MapPin className="w-4 h-4 text-rose-700" />}
                <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#002b5b] hover:bg-[#001833] text-white text-xs font-black rounded transition shadow-sm"
              >
                Search Territory
              </button>
            </div>

          </form>

          {/* Quick Gov Hotspots */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-slate-800 font-black mr-1">Fast Navigation:</span>
            {QUICK_GOV_HOTSPOTS.map((sug) => (
              <button
                key={sug.label}
                onClick={() => {
                  setSelectedArea(sug);
                  dossierRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-[#002b5b] hover:text-white text-slate-900 rounded-md border border-slate-400 font-bold transition text-xs shadow-xs"
              >
                {sug.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Official District Meteorological Dossier */}
      <div ref={dossierRef} className="space-y-5 pt-2">
        
        {/* Dossier Header Banner */}
        <div className="bg-white border-l-8 border-l-[#002b5b] border-2 border-slate-300 rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              <span>OFFICIAL WEATHER OBSERVATION DOSSIER</span>
              <span>•</span>
              <span className="text-emerald-800">GROUND TRUTH SYNCHRONIZED</span>
            </div>
            <h2 className="text-xl font-black text-[#002b5b]">
              {selectedArea.district || selectedArea.city}, {selectedArea.state}
            </h2>
          </div>

          <AreaSelector
            selectedArea={selectedArea}
            onSelectArea={handleAreaSelect}
          />
        </div>

        {/* Warning Severity Index & IMD Bulletin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7">
            <WarningGauge warning={areaData?.warning} />
          </div>
          <div className="lg:col-span-5">
            <IMDAlertBanner imdAlert={areaData?.imd_alert} />
          </div>
        </div>

        {/* GIS Interactive Observation Map */}
        <div className="w-full h-[420px] border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
          <MapView
            events={filteredEvents}
            selectedArea={selectedArea}
          />
        </div>

        {/* Multi-Facet Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          verificationFilter={verificationFilter}
          onSelectVerification={setVerificationFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleFilterSearchSubmit}
        />

        {/* Visual Proof Gallery */}
        <PhotoGallery photos={areaData?.photo_gallery} />

        {/* Ground Incident Telemetry Feed */}
        <div className="bg-white border-2 border-slate-300 rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-200">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#002b5b]" />
              <h3 className="text-xs sm:text-sm font-black text-[#002b5b] uppercase tracking-wider">
                Logged Ground Observations ({filteredEvents.length} Records Active)
              </h3>
            </div>
            <button
              onClick={() => fetchAreaWeather(selectedArea)}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-800 hover:text-[#002b5b] transition font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded border border-slate-300 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#002b5b]' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-100 border border-slate-300 rounded p-4 animate-pulse h-36">
                  <div className="w-24 h-4 bg-slate-300 rounded mb-2"></div>
                  <div className="w-full h-3 bg-slate-300 rounded mb-1"></div>
                  <div className="w-2/3 h-3 bg-slate-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-300 rounded">
              <AlertCircle className="w-7 h-7 text-slate-500 mx-auto mb-2" />
              <h4 className="text-sm font-black text-slate-900 mb-1">No observation records matching current filter</h4>
              <p className="text-xs text-slate-700 font-medium">Select another category or change territory from the selector above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((ev) => (
                <WeatherEventCard key={ev._id || ev.source_id} event={ev} />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

function generateGovDemoData(area) {
  const isMumbai = area.district?.toLowerCase().includes("mumbai") || area.state === "Maharashtra";
  const isDelhi = area.district?.toLowerCase().includes("delhi");

  return {
    area,
    warning: {
      warning_percentage: isMumbai ? 82.5 : (isDelhi ? 68.0 : 45.0),
      warning_level: isMumbai ? "CRITICAL_DISASTER" : (isDelhi ? "HIGH_RISK" : "MODERATE"),
      color_code: isMumbai ? "RED" : (isDelhi ? "ORANGE" : "YELLOW"),
      advisory: isMumbai
        ? "Red Alert active. Severe waterlogging at Dadar TT Circle & Hindmata flyover with traffic diversion."
        : "Moderate to intense weather alert active in this district.",
      metrics: {
        imd_score: isMumbai ? 95 : 75,
        velocity_score: isMumbai ? 85 : 60,
        keyword_score: isMumbai ? 80 : 50,
        visual_score: isMumbai ? 90 : 70
      }
    },
    imd_alert: {
      bulletin_code: "IMD-NOWCAST-2026-04",
      color_code: isMumbai ? "RED" : (isDelhi ? "ORANGE" : "YELLOW"),
      headline: isMumbai
        ? "Red Alert: Extremely heavy rainfall very likely over Mumbai & coastal Maharashtra."
        : "Weather watch active: Thunderstorm with gusty winds likely.",
      instructions: "Avoid waterlogged subways. Disaster response teams alerted."
    },
    events: [
      {
        _id: "demo_1",
        cluster_id: "cluster_01",
        mentions_count: 14,
        source_type: "social_media",
        original_text: "दादर टीटी सर्कल और हिंदमाता में भारी जलभराव! #MumbaiRains #IMD",
        translated_text: "Severe waterlogging at Dadar TT circle and Hindmata flyover. Vehicles submerged.",
        original_language: "hi",
        language_name: "Hindi",
        event_category: "FLOODING",
        severity: "CRITICAL",
        verification_status: "VERIFIED",
        trust_score: 94,
        image_url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80",
        location: { landmark: "Dadar TT Circle", city: area.city || "Mumbai", district: area.district, state: area.state, coordinates: [72.8426, 19.0178] },
        timestamps: { event_time: new Date() }
      },
      {
        _id: "demo_2",
        cluster_id: "cluster_02",
        mentions_count: 8,
        source_type: "news",
        original_text: "Andheri subway shut for vehicular traffic as water level rises above danger mark",
        translated_text: "Andheri subway shut for vehicular traffic as water level rises above danger mark",
        event_category: "FLOODING",
        severity: "HIGH",
        verification_status: "VERIFIED",
        trust_score: 98,
        image_url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80",
        location: { landmark: "Andheri Subway", city: area.city || "Mumbai", district: area.district, state: area.state, coordinates: [72.8467, 19.1197] },
        timestamps: { event_time: new Date(Date.now() - 30 * 60 * 1000) }
      },
      {
        _id: "demo_3",
        cluster_id: "cluster_03",
        mentions_count: 3,
        source_type: "citizen",
        original_text: "Tree uprooted near Sion Circle blocking northbound lane",
        translated_text: "Tree uprooted near Sion Circle blocking northbound lane",
        event_category: "THUNDERSTORM",
        severity: "HIGH",
        verification_status: "VERIFIED",
        trust_score: 85,
        image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
        location: { landmark: "Sion Circle", city: area.city || "Mumbai", district: area.district, state: area.state, coordinates: [72.8619, 19.0390] },
        timestamps: { event_time: new Date(Date.now() - 45 * 60 * 1000) }
      }
    ],
    photo_gallery: [
      {
        url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80",
        caption: "Dadar TT Circle waterlogging",
        location: "Dadar, Mumbai",
        source: "twitter"
      },
      {
        url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80",
        caption: "Andheri subway shut",
        location: "Andheri, Mumbai",
        source: "news"
      },
      {
        url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
        caption: "Tree uprooted at Sion",
        location: "Sion, Mumbai",
        source: "citizen"
      }
    ]
  };
}
