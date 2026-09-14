"use client";
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  User,
  KeyRound,
  LogOut,
  AlertTriangle,
  Loader2,
  Building,
  FileCheck2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/admin';

export default function AdminTriagePage() {
  const [token, setToken] = useState(null);
  const [officer, setOfficer] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [email, setEmail] = useState('admin@mausam.gov.in');
  const [password, setPassword] = useState('Admin@123');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 38,
    verified: 29,
    unverified: 7,
    hoaxes: 2
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('mausam_admin_token');
    const savedOfficer = localStorage.getItem('mausam_admin_officer');
    if (savedToken && savedOfficer) {
      try {
        setToken(savedToken);
        setOfficer(JSON.parse(savedOfficer));
        fetchTriageReports(savedToken);
      } catch {
        handleLogout();
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setIsAuthenticating(true);
    setLoginError(null);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        setOfficer(data.officer);
        localStorage.setItem('mausam_admin_token', data.token);
        localStorage.setItem('mausam_admin_officer', JSON.stringify(data.officer));
        fetchTriageReports(data.token);
      } else {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch {
      if (email === 'admin@mausam.gov.in' && password === 'Admin@123') {
        const demoOfficer = {
          email: 'admin@mausam.gov.in',
          name: 'Officer Rajesh Sharma',
          badge: 'IND-NDMA-0913',
          role: 'CHIEF_DISASTER_CONTROLLER',
          department: 'National Disaster Management Authority (NDMA)'
        };
        const demoToken = 'demo_jwt_token_2026';
        setToken(demoToken);
        setOfficer(demoOfficer);
        localStorage.setItem('mausam_admin_token', demoToken);
        localStorage.setItem('mausam_admin_officer', JSON.stringify(demoOfficer));
        fetchTriageReports(demoToken);
      } else {
        setLoginError('Invalid credentials. Use admin@mausam.gov.in / Admin@123');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setOfficer(null);
    localStorage.removeItem('mausam_admin_token');
    localStorage.removeItem('mausam_admin_officer');
  };

  const fetchTriageReports = async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/weather/events?limit=25');
      if (res.ok) {
        const json = await res.json();
        setReports(json);
      } else {
        throw new Error("Backend offline");
      }
    } catch {
      setReports(DEMO_TRIAGE_REPORTS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_BASE}/verify/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      // Local fallback
    }

    setReports((prev) =>
      prev.map((r) => (r._id === id ? { ...r, verification_status: newStatus } : r))
    );

    if (newStatus === 'VERIFIED') {
      setStats((s) => ({ ...s, verified: s.verified + 1, unverified: Math.max(0, s.unverified - 1) }));
    } else if (newStatus === 'HOAX') {
      setStats((s) => ({ ...s, hoaxes: s.hoaxes + 1, unverified: Math.max(0, s.unverified - 1) }));
    }
  };

  // 1. Unauthenticated Gatekeeper
  if (!token || !officer) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white border-2 border-slate-300 rounded-lg shadow-sm overflow-hidden">
          
          <div className="bg-[#002b5b] text-white p-6 text-center border-b-2 border-slate-400">
            <div className="w-14 h-14 rounded-full bg-[#001f3f] border-2 border-amber-400 mx-auto mb-2.5 flex items-center justify-center text-amber-400 shadow-md">
              <Building className="w-7 h-7" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-1">
              GOVERNMENT OF INDIA • MOES & NDMA
            </span>
            <h1 className="text-lg font-black">Officer Authorization Gatekeeper</h1>
            <p className="text-xs text-slate-200 font-semibold mt-1">Access restricted to Duty Disaster Controllers</p>
          </div>

          <div className="p-6">
            {loginError && (
              <div className="p-3 mb-4 rounded bg-rose-100 border-2 border-rose-400 text-rose-950 text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-800" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
                  Officer Email / Badge ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@mausam.gov.in"
                    className="w-full bg-white text-slate-950 font-bold text-xs pl-9 pr-3 py-2.5 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs"
                  />
                  <User className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white text-slate-950 font-bold text-xs pl-9 pr-3 py-2.5 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs"
                  />
                  <KeyRound className="w-4 h-4 text-slate-600 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-md bg-[#002b5b] hover:bg-[#001833] text-white font-black text-xs shadow-md transition flex items-center justify-center space-x-2 mt-2"
              >
                {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{isAuthenticating ? 'Authenticating Officer...' : 'Authorize & Enter Control Room'}</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t-2 border-slate-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@mausam.gov.in');
                  setPassword('Admin@123');
                  handleLogin();
                }}
                className="text-xs font-black text-[#002b5b] hover:underline"
              >
                Auto-Fill Demo Officer Credentials
              </button>
              <p className="text-xs text-slate-700 font-mono font-bold mt-1">
                admin@mausam.gov.in | Admin@123
              </p>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // 2. Authenticated Control Console
  return (
    <div className="space-y-5">
      
      {/* Officer Dossier Banner */}
      <div className="bg-white border-l-8 border-l-[#002b5b] border-2 border-slate-300 rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-[#002b5b] text-white flex items-center justify-center font-black text-base shadow-sm">
            GOI
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-400">
                DUTY CONTROLLER AUTHORIZED
              </span>
              <span className="text-xs text-slate-800 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {officer.badge}
              </span>
            </div>
            <h1 className="text-base font-black text-[#002b5b]">
              {officer.name}
            </h1>
            <p className="text-xs text-slate-700 font-semibold">{officer.department}</p>
          </div>
        </div>

        {/* Status Counters & Logout */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center space-x-2">
            <div className="px-3.5 py-1.5 bg-slate-100 border-2 border-slate-300 rounded text-center">
              <span className="block text-sm font-black text-slate-950">{stats.total}</span>
              <span className="text-[10px] text-slate-700 font-extrabold uppercase">Total</span>
            </div>
            <div className="px-3.5 py-1.5 bg-emerald-100 border-2 border-emerald-400 rounded text-center">
              <span className="block text-sm font-black text-emerald-950">{stats.verified}</span>
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase">Verified</span>
            </div>
            <div className="px-3.5 py-1.5 bg-rose-100 border-2 border-rose-400 rounded text-center">
              <span className="block text-sm font-black text-rose-950">{stats.hoaxes}</span>
              <span className="text-[10px] text-rose-800 font-extrabold uppercase">Hoax</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

      </div>

      {/* Triage Queue List */}
      <div className="bg-white border-2 border-slate-300 rounded-md p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-200">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-[#002b5b]" />
            <h2 className="text-xs sm:text-sm font-black text-[#002b5b] uppercase tracking-wider">
              Observation Incident Triage Queue ({reports.length} Records)
            </h2>
          </div>
          <span className="text-xs text-slate-700 font-bold">Actions logged under Officer Badge {officer.badge}</span>
        </div>

        <div className="space-y-3.5">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-slate-50 rounded-lg p-4 border-2 border-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start space-x-3.5 flex-1">
                {report.image_url ? (
                  <img
                    src={report.image_url}
                    alt="Evidence"
                    className="w-18 h-18 rounded-md object-cover border-2 border-slate-300 flex-shrink-0"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-md bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                    No Media
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-black text-[#002b5b] bg-slate-200 px-2 py-0.5 rounded border border-slate-300">
                      {report.event_category || 'WEATHER'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-slate-900 border border-slate-400">
                      📍 {report.location?.landmark ? `${report.location.landmark}, ` : ''}{report.location?.city || 'India'}
                    </span>
                    <span className="text-xs text-slate-700 font-semibold">
                      Source: <strong className="text-slate-950 uppercase">{report.source_type}</strong>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-950 font-bold leading-relaxed mb-1.5">
                    {report.translated_text || report.original_text}
                  </p>

                  <div className="flex items-center space-x-3 text-xs text-slate-700 font-semibold">
                    <span>AI Trust Score: <strong className="text-slate-950 font-black">{report.trust_score || 70}%</strong></span>
                    <span>• Status: <strong className={report.verification_status === 'VERIFIED' ? 'text-emerald-950 font-black bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400' : 'text-amber-950 font-black bg-amber-100 px-2 py-0.5 rounded border border-amber-400'}>{report.verification_status}</strong></span>
                  </div>
                </div>
              </div>

              {/* Triage Actions */}
              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <button
                  onClick={() => handleUpdateStatus(report._id, 'VERIFIED')}
                  className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify Record</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(report._id, 'HOAX')}
                  className="px-4 py-2 rounded-md bg-rose-700 hover:bg-rose-800 text-white text-xs font-black transition flex items-center space-x-1.5 shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Flag Hoax</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const DEMO_TRIAGE_REPORTS = [
  {
    _id: "tr_1",
    event_category: "FLOODING",
    severity: "CRITICAL",
    verification_status: "UNVERIFIED",
    trust_score: 68,
    original_text: "दादर टीटी सर्कल के पास पानी भर गया है, बसें फंसी हैं",
    translated_text: "Water has accumulated near Dadar TT Circle, buses are stranded.",
    image_url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80",
    source_type: "citizen",
    location: { landmark: "Dadar TT Circle", city: "Mumbai", state: "Maharashtra" }
  },
  {
    _id: "tr_2",
    event_category: "THUNDERSTORM",
    severity: "HIGH",
    verification_status: "UNVERIFIED",
    trust_score: 60,
    original_text: "Lightning struck an electric pole near Minto bridge",
    translated_text: "Lightning struck an electric pole near Minto bridge",
    image_url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80",
    source_type: "twitter",
    location: { landmark: "Minto Bridge", city: "New Delhi", state: "Delhi" }
  },
  {
    _id: "tr_3",
    event_category: "CYCLONE",
    severity: "HIGH",
    verification_status: "VERIFIED",
    trust_score: 95,
    original_text: "Gale-force winds causing trees to uproot in coastal Chennai",
    translated_text: "Gale-force winds causing trees to uproot in coastal Chennai",
    image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
    source_type: "news",
    location: { landmark: "Marina Beach", city: "Chennai", state: "Tamil Nadu" }
  }
];
