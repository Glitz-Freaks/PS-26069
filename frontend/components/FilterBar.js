"use client";
import React from 'react';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Incidents' },
  { id: 'FLOODING', label: 'Flooding' },
  { id: 'RAINFALL', label: 'Rainfall' },
  { id: 'THUNDERSTORM', label: 'Thunderstorm' },
  { id: 'CYCLONE', label: 'Cyclone' },
  { id: 'HEATWAVE', label: 'Heatwave' },
  { id: 'LANDSLIDE', label: 'Landslide' }
];

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  verificationFilter,
  onSelectVerification,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) {
  return (
    <div className="gov-card rounded-lg p-3.5 bg-white border-2 border-slate-300 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      
      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
        <div className="flex items-center space-x-1 text-slate-700 font-extrabold text-xs pr-1">
          <Filter className="w-3.5 h-3.5 text-[#002b5b]" />
          <span>Filter:</span>
        </div>

        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-bold transition whitespace-nowrap border shadow-xs ${
                isActive
                  ? 'bg-[#002b5b] text-white border-[#001833]'
                  : 'bg-white text-slate-850 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Verification Status & Semantic Search */}
      <div className="flex items-center space-x-2.5">
        
        <select
          value={verificationFilter}
          onChange={(e) => onSelectVerification(e.target.value)}
          className="bg-white text-slate-950 font-bold text-xs px-3 py-1.5 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs cursor-pointer"
        >
          <option value="ALL">All Reports</option>
          <option value="VERIFIED">Verified Only</option>
          <option value="UNVERIFIED">Unverified Only</option>
        </select>

        <form onSubmit={onSearchSubmit} className="relative flex-1 md:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search keywords / AI vector..."
            className="w-full bg-white text-slate-950 font-semibold text-xs placeholder:text-slate-500 pl-8 pr-3 py-1.5 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-600 absolute left-2.5 top-2 pointer-events-none" />
        </form>

      </div>
    </div>
  );
}
