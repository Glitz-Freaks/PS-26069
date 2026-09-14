"use client";
import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { forwardGeocodeSearch } from '../lib/locationService';

export const INDIAN_REGIONS = [
  {
    state: "Uttar Pradesh",
    districts: [
      "Lucknow",
      "Kanpur Nagar",
      "Varanasi",
      "Prayagraj",
      "Agra",
      "Noida",
      "Ghaziabad",
      "Gorakhpur",
      "Meerut",
      "Bareilly",
      "Ayodhya",
      "Aligarh",
      "Jhansi",
      "Mathura",
      "Moradabad",
      "Saharanpur"
    ]
  },
  {
    state: "Maharashtra",
    districts: ["Mumbai Suburban", "Mumbai City", "Pune", "Thane", "Nagpur", "Nashik", "Kolhapur"]
  },
  {
    state: "Delhi",
    districts: ["Central Delhi", "New Delhi", "South West Delhi", "East Delhi", "North Delhi"]
  },
  {
    state: "Tamil Nadu",
    districts: ["Chennai", "Chengalpattu", "Coimbatore", "Madurai", "Tiruvallur"]
  },
  {
    state: "Karnataka",
    districts: ["Bengaluru Urban", "Bengaluru Rural", "Dakshina Kannada", "Mysuru", "Udupi"]
  },
  {
    state: "Kerala",
    districts: ["Wayanad", "Ernakulam", "Idukki", "Thiruvananthapuram", "Kozhikode"]
  },
  {
    state: "West Bengal",
    districts: ["Kolkata", "North 24 Parganas", "Howrah", "Darjeeling", "South 24 Parganas"]
  },
  {
    state: "Assam",
    districts: ["Kamrup Metropolitan", "Golaghat", "Dhubri", "Cachar", "Dibrugarh"]
  },
  {
    state: "Telangana",
    districts: ["Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Warangal"]
  },
  {
    state: "Gujarat",
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Kutch"]
  }
];

const QUICK_HOTSPOTS = [
  { label: "Lucknow (UP)", state: "Uttar Pradesh", district: "Lucknow", city: "Lucknow", lat: 26.8467, lng: 80.9462 },
  { label: "Mumbai Suburban", state: "Maharashtra", district: "Mumbai Suburban", city: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { label: "Central Delhi", state: "Delhi", district: "Central Delhi", city: "New Delhi", lat: 28.6139, lng: 77.2090 },
  { label: "Chennai", state: "Tamil Nadu", district: "Chennai", city: "Chennai", lat: 13.0827, lng: 80.2707 },
  { label: "Bengaluru Urban", state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { label: "Wayanad", state: "Kerala", district: "Wayanad", city: "Wayanad", lat: 11.6854, lng: 76.1320 },
  { label: "Golaghat (Assam)", state: "Assam", district: "Golaghat", city: "Golaghat", lat: 26.5167, lng: 93.9667 }
];

export default function AreaSelector({ selectedArea, onSelectArea }) {
  const [selectedState, setSelectedState] = useState(selectedArea.state || "Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState(selectedArea.district || "Mumbai Suburban");

  const activeRegion = INDIAN_REGIONS.find(r => r.state === selectedState) || INDIAN_REGIONS[0];

  const handleStateChange = async (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const region = INDIAN_REGIONS.find(r => r.state === newState) || INDIAN_REGIONS[0];
    const newDistrict = region.districts[0];
    setSelectedDistrict(newDistrict);
    
    const geo = await forwardGeocodeSearch(`${newDistrict}, ${newState}`);
    onSelectArea({
      state: newState,
      district: newDistrict,
      city: newDistrict,
      lat: geo?.lat || 19.0760,
      lng: geo?.lng || 72.8777
    });
  };

  const handleDistrictChange = async (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    
    const geo = await forwardGeocodeSearch(`${newDistrict}, ${selectedState}`);
    onSelectArea({
      state: selectedState,
      district: newDistrict,
      city: newDistrict,
      lat: geo?.lat || 19.0760,
      lng: geo?.lng || 72.8777
    });
  };

  return (
    <div className="gov-card rounded-lg p-4 bg-white border-2 border-slate-300 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#002b5b]" />
          <h2 className="text-xs font-black text-[#002b5b] uppercase tracking-wider">Territory Filter</h2>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* State Picker */}
          <div className="relative flex-1 sm:w-48">
            <select
              value={selectedState}
              onChange={handleStateChange}
              className="w-full appearance-none bg-white text-slate-950 font-bold text-xs pl-3 pr-8 py-2 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs cursor-pointer"
            >
              {INDIAN_REGIONS.map((r) => (
                <option key={r.state} value={r.state} className="text-slate-950 font-medium">
                  {r.state}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* District Picker */}
          <div className="relative flex-1 sm:w-52">
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className="w-full appearance-none bg-white text-slate-950 font-bold text-xs pl-3 pr-8 py-2 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs cursor-pointer"
            >
              {activeRegion.districts.map((d) => (
                <option key={d} value={d} className="text-slate-950 font-medium">
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-700 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Quick Territory Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pt-1.5 border-t border-slate-200 scrollbar-none">
        <span className="text-xs text-slate-700 font-extrabold flex-shrink-0">Quick Select:</span>
        {QUICK_HOTSPOTS.map((hotspot) => {
          const isActive = selectedDistrict === hotspot.district;
          return (
            <button
              key={hotspot.label}
              onClick={() => {
                setSelectedState(hotspot.state);
                setSelectedDistrict(hotspot.district);
                onSelectArea(hotspot);
              }}
              className={`text-xs px-3 py-1 rounded-md font-bold transition flex-shrink-0 border shadow-xs ${
                isActive
                  ? 'bg-[#002b5b] text-white border-[#001833]'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-[#002b5b] hover:text-white'
              }`}
            >
              {hotspot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
