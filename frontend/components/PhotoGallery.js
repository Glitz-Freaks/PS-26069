"use client";
import React from 'react';
import { Camera } from 'lucide-react';

export default function PhotoGallery({ photos = [] }) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="gov-card rounded-lg p-4 bg-white border-2 border-slate-300 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-[#002b5b]" />
          <h3 className="text-xs font-black text-[#002b5b] uppercase tracking-wider">
            Visual Proof Feed ({photos.length} Images)
          </h3>
        </div>
        <span className="text-xs text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
          Crowdsourced & Media Telemetry
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, idx) => (
          <div key={idx} className="group relative rounded-md overflow-hidden bg-slate-900 border-2 border-slate-300 h-32 shadow-xs">
            <img
              src={photo.url}
              alt={photo.caption || "Weather observation"}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <p className="text-xs font-bold truncate drop-shadow-sm">{photo.caption}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-200 mt-0.5 font-semibold">
                <span className="truncate">{photo.location}</span>
                <span className="uppercase font-black px-1.5 py-0.2 bg-[#002b5b] rounded text-white text-[9px] border border-white/20">
                  {photo.source}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
