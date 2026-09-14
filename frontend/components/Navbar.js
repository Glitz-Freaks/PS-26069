"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, BarChart3, PlusCircle, Lock, LogOut, PhoneCall, Building } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [officerName, setOfficerName] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('mausam_admin_token');
      const officerData = localStorage.getItem('mausam_admin_officer');
      if (token && officerData) {
        setIsLoggedIn(true);
        try {
          const parsed = JSON.parse(officerData);
          setOfficerName(parsed.name || 'Officer');
        } catch {
          setOfficerName('Officer');
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('mausam_admin_token');
    localStorage.removeItem('mausam_admin_officer');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="w-full bg-white border-b-2 border-slate-300 shadow-sm sticky top-0 z-50">
      
      {/* 1. National Tricolor Strip */}
      <div className="gov-tricolor-bar"></div>

      {/* 2. Top Accessibility & Emergency Helpline Bar */}
      <div className="bg-slate-100 border-b border-slate-300 text-xs py-1.5 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <span>भारत सरकार | GOVERNMENT OF INDIA</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-700">पृथ्वी विज्ञान मंत्रालय | MINISTRY OF EARTH SCIENCES</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-rose-800 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
              <span>Disaster Helpline: 1078 (NDMA) | 1070 (NDRF)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Government Emblem & Ministry Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        <Link href="/" className="flex items-center space-x-3.5 group">
          {/* Official Emblem Representation */}
          <div className="w-12 h-12 rounded-full bg-[#001f3f] border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-md flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black text-[#002b5b] tracking-tight">
                मौसम वाणी <span className="text-slate-400 font-normal">|</span> MausamVani
              </span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-400 shadow-xs">
                GOI OFFICIAL PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-700 font-semibold">
              National Meteorological Big Data Analytics Platform • India Meteorological Department (IMD)
            </p>
          </div>
        </Link>

        {/* Live Ground Truth Indicator */}
        <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs font-bold shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>IMD Doppler & AWS Radar Ground Truth Synchronized</span>
        </div>

      </div>

      {/* 4. Official Deep Navy Navigation Strip */}
      <div className="bg-[#002b5b] text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          
          <nav className="flex items-center space-x-2 text-xs font-bold">
            <Link
              href="/"
              className={`px-4 py-2.5 transition rounded-t-md border-b-2 ${
                pathname === '/'
                  ? 'border-amber-400 bg-[#001833] text-amber-300 font-extrabold'
                  : 'border-transparent text-slate-100 hover:text-white hover:bg-[#003d80]'
              }`}
            >
              National Weather Intelligence
            </Link>

            <Link
              href="/report"
              className={`px-4 py-2.5 transition rounded-t-md border-b-2 flex items-center space-x-1.5 ${
                pathname === '/report'
                  ? 'border-amber-400 bg-[#001833] text-amber-300 font-extrabold'
                  : 'border-transparent text-slate-100 hover:text-white hover:bg-[#003d80]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Citizen Observation Portal</span>
            </Link>

            {/* Officer Protected Links (Hidden until logged in) */}
            {isLoggedIn && (
              <>
                <Link
                  href="/admin"
                  className={`px-4 py-2.5 transition rounded-t-md border-b-2 flex items-center space-x-1.5 ${
                    pathname === '/admin'
                      ? 'border-amber-400 bg-[#001833] text-amber-300 font-extrabold'
                      : 'border-transparent text-slate-100 hover:text-white hover:bg-[#003d80]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NDMA Triage Console</span>
                </Link>

                <Link
                  href="/analytics"
                  className={`px-4 py-2.5 transition rounded-t-md border-b-2 flex items-center space-x-1.5 ${
                    pathname === '/analytics'
                      ? 'border-amber-400 bg-[#001833] text-amber-300 font-extrabold'
                      : 'border-transparent text-slate-100 hover:text-white hover:bg-[#003d80]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Big Data Analytics</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Side: Officer Authentication */}
          <div className="flex items-center space-x-3 text-xs">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-slate-200 hidden sm:inline font-medium">
                  Officer: <strong className="text-amber-300 font-bold">{officerName}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold transition flex items-center space-x-1 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/admin"
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded text-xs transition flex items-center space-x-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-slate-900" />
                <span>Officer Login</span>
              </Link>
            )}
          </div>

        </div>
      </div>

    </header>
  );
}
