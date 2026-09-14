"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Layers,
  MapPin,
  RefreshCw,
  Download,
  Activity,
  Radio,
  FileSpreadsheet,
  Globe2,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  CloudRain,
  Waves,
  Zap,
  Mountain,
  Wind,
  Share2,
  ArrowUpRight,
  Radar,
  Eye,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = 'http://localhost:5000/api/weather';

// Smooth CountUp Animation Component
function AnimatedNumber({ value, duration = 1000, decimals = 0, suffix = "", prefix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * target;
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </span>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [officerName, setOfficerName] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Check auth session
  useEffect(() => {
    const officerData = localStorage.getItem('mausam_admin_officer');
    if (officerData) {
      try {
        const parsed = JSON.parse(officerData);
        setOfficerName(parsed.name || 'Disaster Response Officer');
      } catch {
        setOfficerName('Disaster Response Officer');
      }
    }
  }, []);

  // Fetch Real Live Database Stats
  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/stats?_t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[ANALYTICS FETCH ERROR]", err);
      setError("Failed to synchronize with MongoDB Atlas backend. Retrying...");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh interval (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  // Export Analytics Data as JSON Report
  const exportAnalyticsReport = () => {
    if (!stats) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IMD_MoES_National_Analytics_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryIcon = (cat) => {
    switch ((cat || '').toUpperCase()) {
      case 'RAINFALL': return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'FLOODING': return <Waves className="w-4 h-4 text-blue-700" />;
      case 'HEATWAVE': return <Flame className="w-4 h-4 text-amber-600" />;
      case 'LANDSLIDE': return <Mountain className="w-4 h-4 text-emerald-700" />;
      case 'THUNDERSTORM': return <Zap className="w-4 h-4 text-purple-600" />;
      case 'CYCLONE': return <Wind className="w-4 h-4 text-rose-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-3">

      {/* 1. Official Government Header & Live Connection Status */}
      <div className="animate-fade-in-up bg-white border-l-8 border-l-[#002b5b] border-2 border-slate-300 rounded-lg p-5 shadow-sm relative overflow-hidden">
        {/* Subtle background ambient radar pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-96 h-96 rounded-full border-4 border-[#002b5b] flex items-center justify-center animate-radar-sweep">
            <div className="w-48 h-48 rounded-full border-2 border-[#002b5b]"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                GOVERNMENT OF INDIA • MOES BIG DATA CENTER
              </span>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300 animate-pulse-ring">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>MongoDB Atlas Synced</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-300">
                <Radar className="w-3.5 h-3.5 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Doppler Ground Truth Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#002b5b] tracking-tight flex items-center gap-2">
              <span>National Meteorological Big Data Analytics</span>
              <Sparkles className="w-5 h-5 text-amber-500 animate-float-slow" />
            </h1>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              Real-time multi-source spatial-temporal aggregations, deduplication cluster metrics, and verified hazard telemetry across India.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {lastUpdated && (
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Telemetry Synced</span>
                <span className="text-xs font-black text-slate-800 flex items-center gap-1 justify-end">
                  <Clock className="w-3.5 h-3.5 text-[#002b5b]" />
                  {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
                </span>
              </div>
            )}

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded text-xs font-bold border transition-all duration-300 flex items-center gap-1.5 shadow-xs ${
                autoRefresh
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-emerald-100'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle automatic 30s background sync"
            >
              <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
              <span>{autoRefresh ? 'Auto-Sync ON' : 'Auto-Sync OFF'}</span>
            </button>

            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="px-3.5 py-2 bg-[#002b5b] hover:bg-[#001f3f] active:scale-95 text-white rounded font-bold text-xs transition-all duration-200 flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Aggregating...' : 'Sync Now'}</span>
            </button>

            <button
              onClick={exportAnalyticsReport}
              disabled={!stats}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border-2 border-slate-300 rounded font-bold text-xs transition-all duration-200 flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#002b5b]" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Officer Session Banner (If Authenticated) */}
        {officerName && (
          <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs animate-fade-in-up">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authenticated Officer: <strong className="text-[#002b5b] font-black">{officerName}</strong></span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">NDMA National Command Clearance Level 1</span>
            </div>
            <Link href="/admin" className="text-[#002b5b] hover:underline font-extrabold flex items-center gap-1 group">
              <span>Open Triage Console</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !stats && (
        <div className="p-12 text-center bg-white border-2 border-slate-300 rounded-lg shadow-sm animate-fade-in-up">
          <div className="w-12 h-12 border-4 border-[#002b5b] border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-black text-[#002b5b]">Performing Live MongoDB Atlas Aggregations...</p>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Computing real-time deduplication ratios, spatial cluster vectors, and multi-lingual threat indexes.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 text-rose-950 p-4 rounded-lg flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <AlertOctagon className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchStats(true)}
            className="px-3 py-1 bg-rose-700 text-white rounded text-xs font-black hover:bg-rose-800 active:scale-95 transition"
          >
            Retry Sync
          </button>
        </div>
      )}

      {stats && (
        <>
          {/* 2. Primary KPI Telemetry Cards with CountUp & Hover Lift */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Total Crawled & Ingested Records */}
            <div className="animate-fade-in-up delay-75 bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm hover:border-[#002b5b] hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-700 mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Total Ingested Records</span>
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center border border-slate-300 text-[#002b5b] group-hover:bg-[#002b5b] group-hover:text-amber-400 transition-colors">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-[#002b5b]">
                  <AnimatedNumber value={stats.total_events} duration={1200} />
                </span>
                <span className="text-xs font-bold text-slate-500">records</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span>Multi-Source Ingestion</span>
                <span className="font-bold text-[#002b5b]">
                  <AnimatedNumber value={stats.total_clusters || stats.total_events} duration={1200} /> Clusters
                </span>
              </div>
            </div>

            {/* KPI 2: Ground Truth Verified */}
            <div className="animate-fade-in-up delay-150 bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm hover:border-emerald-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-700 mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">Ground Truth Verified</span>
                <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center border border-emerald-300 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-800">
                  <AnimatedNumber value={stats.verified_events} duration={1200} />
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  <AnimatedNumber value={stats.accuracy_rate} duration={1200} decimals={1} suffix="% Rate" />
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span>Unverified / Pending</span>
                <span className="font-bold text-amber-700">
                  <AnimatedNumber value={stats.unverified_events || 0} duration={1200} /> items
                </span>
              </div>
            </div>

            {/* KPI 3: Active IMD Bulletins */}
            <div className="animate-fade-in-up delay-225 bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm hover:border-rose-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-700 mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-900">Active IMD Bulletins</span>
                <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center border border-rose-300 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-800">
                  <AnimatedNumber value={stats.active_alerts} duration={1200} />
                </span>
                <span className="text-xs font-bold text-rose-700">official warnings</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span>Doppler Radar Sync</span>
                <span className="font-bold text-rose-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                  100% Active
                </span>
              </div>
            </div>

            {/* KPI 4: Deduplication Cluster Ratio */}
            <div className="animate-fade-in-up delay-300 bg-white border-2 border-slate-300 rounded-lg p-4 shadow-sm hover:border-[#002b5b] hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between text-slate-700 mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Deduplication Ratio</span>
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center border border-slate-300 text-[#002b5b] group-hover:bg-[#002b5b] group-hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-950">
                  {stats.deduplication_ratio}
                </span>
                <span className="text-xs font-bold text-slate-500">cluster index</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span>Spatial Tolerance</span>
                <span className="font-bold text-[#002b5b]">25 km • 3 hr window</span>
              </div>
            </div>

          </div>

          {/* 3. Main Analytics Grid: Geographic Impact vs Hazard Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Top Impacted States with Animated Shimmer Bars (7 Cols) */}
            <div className="animate-fade-in-up delay-150 lg:col-span-7 bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded bg-slate-100 border border-slate-300 text-[#002b5b]">
                    <MapPin className="w-4 h-4 text-[#002b5b]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#002b5b] uppercase tracking-wider">
                      Geographic Vulnerability Distribution
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      Ranked by confirmed incident volume from MongoDB Atlas aggregations
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-300 shadow-xs">
                  {stats.top_affected_states?.length || 0} States Tracked
                </span>
              </div>

              <div className="space-y-3.5">
                {stats.top_affected_states && stats.top_affected_states.length > 0 ? (
                  stats.top_affected_states.map((st, idx) => (
                    <div
                      key={st.state}
                      className="p-2.5 rounded-md hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-300 group"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 group-hover:bg-[#002b5b] group-hover:text-white transition-colors text-slate-800 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-black text-slate-950 text-sm group-hover:text-[#002b5b] transition-colors">
                            {st.state}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-slate-600">
                            {st.shareOfTotal}% share
                          </span>
                          <span className="font-black text-[#002b5b] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300">
                            <AnimatedNumber value={st.count} duration={1000} /> Incidents
                          </span>
                        </div>
                      </div>

                      {/* Animated Progress Bar with Shimmer Beam */}
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300 relative">
                        <div
                          className="bg-gradient-to-r from-[#002b5b] via-sky-700 to-sky-600 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${st.percentage}%` }}
                        >
                          {/* Animated Shimmer Light Beam */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-4">No regional data points logged yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: Hazard Classification & Threat Matrix (5 Cols) */}
            <div className="animate-fade-in-up delay-225 lg:col-span-5 space-y-5">
              
              {/* Event Categories */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded bg-slate-100 border border-slate-300 text-[#002b5b]">
                      <Activity className="w-4 h-4 text-[#002b5b]" />
                    </div>
                    <h2 className="text-sm font-black text-[#002b5b] uppercase tracking-wider">
                      Hazard Classification
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Real Tally</span>
                </div>

                <div className="space-y-2.5">
                  {stats.category_breakdown && stats.category_breakdown.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100/70 hover:translate-x-1 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded bg-white border border-slate-200 group-hover:scale-110 transition-transform">
                          {getCategoryIcon(cat.category)}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block group-hover:text-[#002b5b] transition-colors">
                            {cat.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">{cat.percentage}% of total events</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#002b5b] bg-white px-2.5 py-1 rounded border border-slate-300 shadow-xs">
                        <AnimatedNumber value={cat.count} duration={1000} /> Events
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Severity Distribution Matrix */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                  <span>Incident Threat Severity Matrix</span>
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-md bg-rose-50 border-2 border-rose-300 hover:shadow-sm hover:border-rose-400 transition-all duration-200">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 block">Critical</span>
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    </div>
                    <span className="text-2xl font-black text-rose-800">
                      <AnimatedNumber value={stats.severity_breakdown?.CRITICAL || 0} duration={1000} />
                    </span>
                    <span className="text-[10px] text-rose-700 block font-semibold mt-0.5">Immediate NDMA Action</span>
                  </div>

                  <div className="p-3 rounded-md bg-amber-50 border-2 border-amber-300 hover:shadow-sm hover:border-amber-400 transition-all duration-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">High</span>
                    <span className="text-2xl font-black text-amber-800">
                      <AnimatedNumber value={stats.severity_breakdown?.HIGH || 0} duration={1000} />
                    </span>
                    <span className="text-[10px] text-amber-700 block font-semibold mt-0.5">SDRF / District Alert</span>
                  </div>

                  <div className="p-3 rounded-md bg-sky-50 border-2 border-sky-300 hover:shadow-sm hover:border-sky-400 transition-all duration-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 block">Moderate</span>
                    <span className="text-2xl font-black text-sky-800">
                      <AnimatedNumber value={stats.severity_breakdown?.MODERATE || 0} duration={1000} />
                    </span>
                    <span className="text-[10px] text-sky-700 block font-semibold mt-0.5">Regional Nowcast Watch</span>
                  </div>

                  <div className="p-3 rounded-md bg-slate-100 border-2 border-slate-300 hover:shadow-sm hover:border-slate-400 transition-all duration-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 block">Low</span>
                    <span className="text-2xl font-black text-slate-900">
                      <AnimatedNumber value={stats.severity_breakdown?.LOW || 0} duration={1000} />
                    </span>
                    <span className="text-[10px] text-slate-600 block font-semibold mt-0.5">Routine Advisory</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* 4. Multi-Source Ingestion Telemetry & Pipeline Performance */}
          <div className="animate-fade-in-up delay-300 bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-slate-200 gap-2">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded bg-slate-100 border border-slate-300 text-[#002b5b]">
                  <Globe2 className="w-4 h-4 text-[#002b5b]" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#002b5b] uppercase tracking-wider">
                    Multi-Source Ingestion Pipeline Telemetry
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    Real-time data ingestion share from national news feeds, social media crawlers, and citizen reports
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Hallucination Filter Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {stats.source_breakdown && stats.source_breakdown.map((src) => (
                <div
                  key={src.source}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 hover:border-[#002b5b] hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      {src.source === 'news' ? 'National News Feeds' : src.source === 'social_media' ? 'Social Media Telemetry' : src.source}
                    </span>
                    <span className="text-xs font-black text-[#002b5b] bg-white px-2 py-0.5 rounded border border-slate-300">
                      <AnimatedNumber value={src.percentage} duration={1000} decimals={1} suffix="%" />
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-2xl font-black text-slate-900">
                      <AnimatedNumber value={src.count} duration={1000} />
                    </span>
                    <span className="text-xs text-slate-600 font-semibold">verified articles / posts</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden relative">
                    <div
                      className="bg-[#002b5b] h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${src.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-sweep"></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Translation & Semantic Model Health */}
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-300 hover:shadow-xs transition-all duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950">Indic NLP Engine</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Glossary Coverage:</span>
                    <span className="text-emerald-900 font-black">Hindi, Bengali, Marathi, etc.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vector Embeddings:</span>
                    <span className="text-[#002b5b] font-black">BAAI/bge-small-en-v1.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cross-Validation:</span>
                    <span className="text-emerald-900 font-black">IMD Radar Correlation</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 5. Live Verified Meteorological Incident Stream */}
          <div className="animate-fade-in-up delay-375 bg-white border-2 border-slate-300 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="relative flex items-center justify-center">
                  <Radio className="w-5 h-5 text-rose-700 animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#002b5b] uppercase tracking-wider">
                    Live Verified Incident Stream (Latest Ingestions)
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    Real-time meteorological incidents parsed, translated, and indexed in MongoDB Atlas
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="text-xs font-black text-[#002b5b] hover:underline flex items-center gap-1 group"
              >
                <span>View Full National Map</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {stats.latest_events && stats.latest_events.length > 0 ? (
                stats.latest_events.map((evt, i) => (
                  <div
                    key={evt._id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50 px-2.5 rounded-md transition-all duration-200 border-l-2 border-transparent hover:border-l-[#002b5b] group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Hazard Category Badge */}
                        <span className="text-[11px] font-black px-2 py-0.5 rounded bg-slate-100 text-[#002b5b] border border-slate-300 flex items-center gap-1 group-hover:bg-white transition-colors">
                          {getCategoryIcon(evt.event_category)}
                          {evt.event_category}
                        </span>

                        {/* Severity Badge */}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                          evt.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-950 border-rose-300' :
                          evt.severity === 'HIGH' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                          'bg-sky-100 text-sky-950 border-sky-300'
                        }`}>
                          {evt.severity}
                        </span>

                        {/* Verification Status */}
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          {evt.verification_status} ({evt.trust_score || 95}% Trust)
                        </span>

                        {/* Source Tag */}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          • Source: {evt.source_type || 'Feed'}
                        </span>
                      </div>

                      {/* Text / Headline */}
                      <p className="text-xs font-bold text-slate-900 leading-snug pt-0.5 group-hover:text-[#002b5b] transition-colors">
                        {evt.translated_text || evt.original_text}
                      </p>

                      {/* Location & Coordinates */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-semibold pt-0.5">
                        <span className="flex items-center gap-1 text-[#002b5b] font-bold">
                          <MapPin className="w-3.5 h-3.5 text-[#002b5b]" />
                          {evt.location?.landmark ? `${evt.location.landmark}, ` : ''}
                          {evt.location?.city || evt.location?.district || 'Unknown'}, {evt.location?.state || 'India'}
                        </span>
                        {evt.location?.coordinates && (
                          <span className="text-slate-400 text-[10px]">
                            ({evt.location.coordinates[1]?.toFixed(3)}°N, {evt.location.coordinates[0]?.toFixed(3)}°E)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        {evt.timestamps?.event_time
                          ? new Date(evt.timestamps.event_time).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Recent'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {evt.timestamps?.event_time
                          ? new Date(evt.timestamps.event_time).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">No recent live events found in stream.</p>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
