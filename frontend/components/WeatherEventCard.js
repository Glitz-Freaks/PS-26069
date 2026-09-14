"use client";
import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, MapPin, ExternalLink, Layers } from 'lucide-react';

export default function WeatherEventCard({ event }) {
  const isVerified = event.verification_status === 'VERIFIED';
  const severity = event.severity || 'MODERATE';
  const category = event.event_category || 'RAINFALL';

  const severityBadgeStyles = {
    CRITICAL: "bg-rose-100 text-rose-950 border-rose-400 font-black",
    HIGH: "bg-orange-100 text-orange-950 border-orange-400 font-black",
    MODERATE: "bg-amber-100 text-amber-950 border-amber-400 font-black",
    LOW: "bg-emerald-100 text-emerald-950 border-emerald-400 font-black"
  };

  return (
    <div className="gov-card rounded-lg p-4 sm:p-5 bg-white border-2 border-slate-300 shadow-sm hover:border-[#002b5b] transition-all relative">
      
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#002b5b] bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            {category}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded border shadow-xs ${severityBadgeStyles[severity] || severityBadgeStyles.MODERATE}`}>
            {severity}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {event.mentions_count > 1 && (
            <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>{event.mentions_count} Clustered</span>
            </span>
          )}

          <span
            className={`inline-flex items-center space-x-1 text-[11px] font-black px-2.5 py-0.5 rounded border shadow-xs ${
              isVerified
                ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            {isVerified ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> : <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isVerified ? `VERIFIED (${event.trust_score || 90}%)` : 'UNVERIFIED'}</span>
          </span>
        </div>
      </div>

      {/* Main Translated Text */}
      <p className="text-xs sm:text-sm text-slate-950 font-bold leading-relaxed mb-2.5">
        {event.translated_text || event.original_text}
      </p>

      {/* Original Language Vernacular Box if translated */}
      {event.original_language && event.original_language !== 'en' && (
        <div className="bg-slate-100 rounded-md p-2.5 mb-3 border border-slate-300 text-xs">
          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
            Original Text ({event.language_name || event.original_language}):
          </span>
          <p className="text-slate-900 font-medium italic text-xs">{event.original_text}</p>
        </div>
      )}

      {/* Image Evidence Preview if attached */}
      {event.image_url && (
        <div className="relative w-full h-44 rounded-md overflow-hidden mb-3 border-2 border-slate-300 bg-slate-100">
          <img
            src={event.image_url}
            alt="Weather Evidence"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 text-[10px] font-black text-white bg-[#001f3f]/90 px-2.5 py-1 rounded border border-white/20 shadow-md">
            Visual Confirmation Proof
          </span>
        </div>
      )}

      {/* Footer Metadata */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 font-semibold pt-2.5 border-t border-slate-200 gap-2">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-[#002b5b] flex-shrink-0" />
          <span className="truncate max-w-[220px] text-slate-900 font-bold">
            {event.location?.landmark ? `${event.location.landmark}, ` : ''}{event.location?.city || 'India'}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {event.timestamps?.event_time
                ? new Date(event.timestamps.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent'}
            </span>
          </span>

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002b5b] hover:text-[#001833] font-black underline flex items-center space-x-0.5"
            >
              <span>Source Feed</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
