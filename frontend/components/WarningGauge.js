"use client";
import React from 'react';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export default function WarningGauge({ warning }) {
  const percentage = warning?.warning_percentage ?? 45;
  const level = warning?.warning_level ?? 'MODERATE';
  const color = warning?.color_code ?? 'YELLOW';
  const advisory = warning?.advisory ?? 'Weather observation telemetry active in this district.';
  const metrics = warning?.metrics ?? {
    imd_score: 40,
    velocity_score: 50,
    keyword_score: 30,
    visual_score: 60
  };

  const badgeConfig = {
    GREEN: {
      color: "#15803d",
      bg: "bg-emerald-100 text-emerald-950 border-emerald-400 font-black",
      label: "LOW RISK / NORMAL",
      icon: ShieldCheck
    },
    YELLOW: {
      color: "#b45309",
      bg: "bg-amber-100 text-amber-950 border-amber-400 font-black",
      label: "MODERATE WATCH",
      icon: Info
    },
    ORANGE: {
      color: "#c2410c",
      bg: "bg-orange-100 text-orange-950 border-orange-400 font-black",
      label: "HIGH RISK ALERT",
      icon: AlertTriangle
    },
    RED: {
      color: "#b91c1c",
      bg: "bg-rose-100 text-rose-950 border-rose-400 font-black",
      label: "CRITICAL DISASTER",
      icon: AlertTriangle
    }
  };

  const currentTheme = badgeConfig[color] || badgeConfig.YELLOW;
  const IconComponent = currentTheme.icon;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="gov-card rounded-lg p-5 bg-white border-2 border-slate-300 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: Circular Gauge */}
        <div className="flex items-center space-x-5">
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-slate-200"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={currentTheme.color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-[#0f172a]">{percentage}%</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Risk Score</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs border shadow-xs ${currentTheme.bg}`}>
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span>{currentTheme.label}</span>
              </span>
            </div>
            <h3 className="text-base font-black text-[#002b5b] tracking-tight">Dynamic Warning Index</h3>
            <p className="text-xs text-slate-800 font-medium max-w-sm leading-relaxed mt-1">{advisory}</p>
          </div>
        </div>

        {/* Right: 4-Pillar Breakdown */}
        <div className="w-full sm:w-auto grid grid-cols-2 gap-2.5 bg-slate-100 p-3.5 rounded-lg border-2 border-slate-300">
          
          <div className="p-2.5 rounded-md bg-white border border-slate-300 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
              <span>IMD Alert (40%)</span>
              <span className="text-[#002b5b] font-black">{metrics.imd_score}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#002b5b] h-full rounded-full" style={{ width: `${metrics.imd_score}%` }}></div>
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-300 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
              <span>Social Velocity (25%)</span>
              <span className="text-orange-700 font-black">{metrics.velocity_score}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-600 h-full rounded-full" style={{ width: `${metrics.velocity_score}%` }}></div>
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-300 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
              <span>Keywords (15%)</span>
              <span className="text-amber-700 font-black">{metrics.keyword_score}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${metrics.keyword_score}%` }}></div>
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-300 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1">
              <span>Photos (20%)</span>
              <span className="text-emerald-800 font-black">{metrics.visual_score}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${metrics.visual_score}%` }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
