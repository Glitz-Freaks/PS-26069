"use client";
import React from 'react';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function IMDAlertBanner({ imdAlert }) {
  if (!imdAlert) {
    return (
      <div className="gov-card rounded-lg p-4 bg-white border-2 border-emerald-400 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">IMD Status: Normal / No Active Hazard</h4>
            <p className="text-xs text-slate-700 font-medium">Atmospheric conditions within baseline safety limits.</p>
          </div>
        </div>
        <span className="text-xs font-extrabold px-3 py-1 rounded bg-emerald-100 text-emerald-950 border border-emerald-400">
          GREEN STATUS
        </span>
      </div>
    );
  }

  const color = imdAlert.color_code?.toUpperCase() || 'YELLOW';

  const badgeConfig = {
    RED: {
      cardBorder: "border-2 border-rose-500 bg-rose-50/70",
      pill: "bg-rose-700 text-white font-black",
      title: "IMD RED ALERT (TAKE ACTION)",
      advisoryBg: "bg-rose-100/80 border border-rose-300 text-rose-950"
    },
    ORANGE: {
      cardBorder: "border-2 border-orange-500 bg-orange-50/70",
      pill: "bg-orange-600 text-white font-black",
      title: "IMD ORANGE NOWCAST (BE PREPARED)",
      advisoryBg: "bg-orange-100/80 border border-orange-300 text-orange-950"
    },
    YELLOW: {
      cardBorder: "border-2 border-amber-500 bg-amber-50/70",
      pill: "bg-amber-400 text-slate-950 font-black",
      title: "IMD YELLOW WATCH (BE UPDATED)",
      advisoryBg: "bg-amber-100/80 border border-amber-300 text-amber-950"
    },
    GREEN: {
      cardBorder: "border-2 border-emerald-500 bg-emerald-50/70",
      pill: "bg-emerald-700 text-white font-black",
      title: "IMD GREEN STATUS (NORMAL)",
      advisoryBg: "bg-emerald-100/80 border border-emerald-300 text-emerald-950"
    }
  };

  const currentTheme = badgeConfig[color] || badgeConfig.YELLOW;

  return (
    <div className={`gov-card rounded-lg p-4 shadow-sm ${currentTheme.cardBorder}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded shadow-xs ${currentTheme.pill}`}>
            {currentTheme.title}
          </span>
          <span className="text-xs text-slate-700 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
            {imdAlert.bulletin_code || 'IMD-BULLETIN'}
          </span>
        </div>

        <a
          href={imdAlert.source_url || "https://mausam.imd.gov.in"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs font-bold text-[#002b5b] hover:underline bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs"
        >
          <span>Mausam IMD Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <h3 className="text-xs sm:text-sm font-black text-slate-950 mb-1.5 leading-snug">
        {imdAlert.headline}
      </h3>

      {imdAlert.instructions && (
        <div className={`text-xs p-3 rounded-md leading-relaxed mt-2 ${currentTheme.advisoryBg}`}>
          <strong className="font-extrabold text-slate-950">Official IMD Advisory: </strong>
          <span className="font-semibold">{imdAlert.instructions}</span>
        </div>
      )}
    </div>
  );
}
