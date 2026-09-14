"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, AlertOctagon, Layers, MapPin, Lock, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    total_events: 184,
    verified_events: 142,
    active_alerts: 5,
    top_affected_states: [
      { state: "Maharashtra", count: 62, percentage: 85 },
      { state: "Delhi", count: 41, percentage: 65 },
      { state: "Tamil Nadu", count: 32, percentage: 50 },
      { state: "Kerala", count: 28, percentage: 45 },
      { state: "Assam", count: 21, percentage: 35 }
    ],
    category_breakdown: [
      { category: "FLOODING", count: 74, color: "bg-[#002b5b]" },
      { category: "RAINFALL", count: 52, color: "bg-sky-700" },
      { category: "THUNDERSTORM", count: 26, color: "bg-amber-600" },
      { category: "CYCLONE", count: 18, color: "bg-rose-700" },
      { category: "LANDSLIDE", count: 14, color: "bg-emerald-700" }
    ]
  });

  useEffect(() => {
    const token = localStorage.getItem('mausam_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="bg-white border-2 border-slate-300 rounded-lg p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto mb-3 flex items-center justify-center text-[#002b5b] border-2 border-slate-300">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-[#002b5b] mb-1">Restricted Meteorological Analytics</h2>
          <p className="text-xs text-slate-700 font-semibold mb-6">
            National statistical telemetry is restricted to authorized disaster management officers.
          </p>
          <Link
            href="/admin"
            className="inline-block px-5 py-2.5 rounded bg-[#002b5b] hover:bg-[#001833] text-white font-black text-xs transition shadow-sm"
          >
            Go to Officer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="bg-white border-l-8 border-l-[#002b5b] border-2 border-slate-300 rounded-md p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-0.5">
            GOVERNMENT OF INDIA • MOES BIG DATA CENTER
          </span>
          <h1 className="text-base sm:text-lg font-black text-[#002b5b]">National Meteorological Big Data Analytics</h1>
          <p className="text-xs text-slate-700 font-semibold">Statistical aggregation of weather telemetry, deduplication metrics, and disaster hotspots</p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 rounded border border-slate-300 text-xs font-bold text-slate-800 shadow-xs">
          <FileSpreadsheet className="w-4 h-4 text-[#002b5b]" />
          <span>Automated Daily Digest</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        <div className="bg-white border-2 border-slate-300 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Logged Records</span>
            <Layers className="w-5 h-5 text-[#002b5b]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#002b5b]">{stats.total_events}</span>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">Multi-source automated crawling</p>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">IMD & AI Verified</span>
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-800">{stats.verified_events}</span>
          <p className="text-xs text-emerald-800 font-bold mt-0.5">77.1% Ground Truth Accuracy</p>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active IMD Bulletins</span>
            <AlertOctagon className="w-5 h-5 text-rose-700" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-800">{stats.active_alerts}</span>
          <p className="text-xs text-rose-800 font-bold mt-0.5">2 Red • 2 Orange • 1 Yellow</p>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Deduplication Ratio</span>
            <TrendingUp className="w-5 h-5 text-[#002b5b]" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-950">4.2 : 1</span>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">Spatio-Temporal Clusters</p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Top Impacted States */}
        <div className="lg:col-span-7 bg-white border-2 border-slate-300 rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#002b5b]" />
              <h2 className="text-xs sm:text-sm font-black text-[#002b5b] uppercase tracking-wider">Top Impacted States / UTs</h2>
            </div>
            <span className="text-xs text-slate-700 font-bold">Incident Volume</span>
          </div>

          <div className="space-y-3.5">
            {stats.top_affected_states.map((st) => (
              <div key={st.state}>
                <div className="flex justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>{st.state}</span>
                  <span className="font-black text-[#002b5b]">{st.count} Incidents</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="bg-[#002b5b] h-full rounded-full"
                    style={{ width: `${st.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-white border-2 border-slate-300 rounded-md p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-200">
            <h2 className="text-xs sm:text-sm font-black text-[#002b5b] uppercase tracking-wider">Event Categories</h2>
            <span className="text-xs text-slate-700 font-bold">Breakdown</span>
          </div>

          <div className="space-y-3">
            {stats.category_breakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-md bg-slate-100 border border-slate-300">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${cat.color} flex-shrink-0`}></span>
                  <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                </div>
                <span className="text-xs font-black text-[#002b5b] bg-white px-2.5 py-0.5 rounded border border-slate-300">
                  {cat.count} Events
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
