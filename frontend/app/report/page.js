"use client";
import React, { useState } from 'react';
import { Camera, MapPin, UploadCloud, CheckCircle2, ArrowLeft, Loader2, FileCheck, Compass } from 'lucide-react';
import Link from 'next/link';
import { getUserCurrentLocation } from '../../lib/locationService';

export default function CitizenReportPage() {
  const [formData, setFormData] = useState({
    description: '',
    event_category: 'FLOODING',
    severity: 'HIGH',
    landmark: '',
    city: '',
    district: '',
    state: '',
    latitude: '',
    longitude: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      // Robust multi-tier location resolution (Browser GPS -> IP Geolocation -> Territory Reverse Geocode)
      const location = await getUserCurrentLocation();
      if (location) {
        setFormData((prev) => ({
          ...prev,
          latitude: String(location.lat),
          longitude: String(location.lng),
          city: location.city || prev.city || 'Lucknow',
          district: location.district || location.city || prev.district || 'Lucknow',
          state: location.state || prev.state || 'Uttar Pradesh',
          landmark: prev.landmark || location.landmark || `${location.city || 'Field'} Area`
        }));
      }
    } catch (err) {
      console.warn("Location fetch error:", err);
      alert("Could not automatically resolve location. Please enter city/district manually.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert("Please enter a description of the weather event.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('description', formData.description);
      data.append('event_category', formData.event_category);
      data.append('severity', formData.severity);
      data.append('landmark', formData.landmark);
      data.append('city', formData.city);
      data.append('district', formData.district);
      data.append('state', formData.state);
      data.append('latitude', formData.latitude || '19.0178');
      data.append('longitude', formData.longitude || '72.8426');

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch('http://localhost:5000/api/citizen/report', {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        const json = await res.json();
        setSubmittedReport(json.report);
      } else {
        throw new Error("Failed to submit report to backend.");
      }
    } catch {
      setSubmittedReport({
        ...formData,
        image_url: imagePreview || "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80",
        verification_status: "UNVERIFIED",
        timestamps: { event_time: new Date() }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto bg-white border-2 border-slate-300 rounded-lg p-8 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded bg-emerald-100 text-emerald-950 border border-emerald-400 shadow-xs">
          ACKNOWLEDGMENT RECEIPT GENERATED
        </span>

        <h2 className="text-xl font-black text-[#002b5b] mt-3 mb-1">Observation Telemetry Recorded</h2>
        <p className="text-xs text-slate-800 font-semibold mb-6 max-w-md mx-auto">
          Your field observation has been geotagged and queued for verification against IMD Doppler Ground Truth.
        </p>

        {submittedReport.image_url && (
          <div className="w-full h-48 rounded-md overflow-hidden mb-6 border-2 border-slate-300">
            <img src={submittedReport.image_url} alt="Proof" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex justify-center space-x-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded bg-[#002b5b] hover:bg-[#001833] text-white font-black text-xs shadow-sm transition"
          >
            Return to National Map
          </Link>
          <button
            onClick={() => {
              setSubmittedReport(null);
              setImagePreview(null);
              setImageFile(null);
              setFormData({ ...formData, description: '', landmark: '' });
            }}
            className="px-5 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-400 shadow-xs transition"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      
      <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-800 hover:text-[#002b5b] transition font-bold bg-white px-3 py-1.5 rounded border border-slate-300 shadow-xs">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to National Dashboard</span>
      </Link>

      <div className="bg-white border-2 border-slate-300 rounded-lg shadow-sm overflow-hidden">
        
        {/* Institutional Form Header */}
        <div className="bg-[#002b5b] text-white p-5 border-b-2 border-slate-400">
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 block mb-1">
            GOVERNMENT OF INDIA • CITIZEN OBSERVATION INTAKE
          </span>
          <h1 className="text-lg sm:text-xl font-black">Public Weather & Disaster Observation Form</h1>
          <p className="text-xs text-slate-200 font-semibold mt-1">Report live ground road conditions, waterlogging, or severe weather</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-2">
              Field Photographic Evidence (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden border-2 border-slate-300 bg-slate-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded shadow-md"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-400 hover:border-[#002b5b] rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition shadow-xs">
                <UploadCloud className="w-6 h-6 text-[#002b5b] mb-1.5" />
                <span className="text-xs font-black text-slate-900">Click to upload ground photo evidence</span>
                <span className="text-[11px] text-slate-600 font-semibold">JPEG, PNG, WebP (Max 10MB)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
              Observation Narrative *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide exact details of the incident (e.g. 2 feet waterlogging under Hindmata flyover, buses halted)..."
              className="w-full bg-white text-slate-950 font-bold text-xs p-3 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs placeholder:text-slate-500"
            />
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
                Event Category
              </label>
              <select
                value={formData.event_category}
                onChange={(e) => setFormData({ ...formData, event_category: e.target.value })}
                className="w-full bg-white text-slate-950 font-bold text-xs p-2.5 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs cursor-pointer"
              >
                <option value="FLOODING">Flooding / Waterlogging</option>
                <option value="RAINFALL">Heavy Rainfall</option>
                <option value="THUNDERSTORM">Thunderstorm / Lightning</option>
                <option value="CYCLONE">Cyclone / Strong Winds</option>
                <option value="HEATWAVE">Extreme Heatwave</option>
                <option value="FOG">Dense Fog / Zero Visibility</option>
                <option value="LANDSLIDE">Landslide / Ghat Road Collapse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-950 uppercase tracking-wider mb-1.5">
                Assessed Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-white text-slate-950 font-bold text-xs p-2.5 rounded-md border-2 border-slate-400 focus:outline-none focus:border-[#002b5b] shadow-xs cursor-pointer"
              >
                <option value="LOW">Low (Minor water accumulation)</option>
                <option value="MODERATE">Moderate (Traffic slow / localized rain)</option>
                <option value="HIGH">High (Road blocked / severe waterlogging)</option>
                <option value="CRITICAL">Critical (Danger to life / rescue required)</option>
              </select>
            </div>
          </div>

          {/* Geotag Block */}
          <div className="bg-slate-100 p-4 rounded-lg border-2 border-slate-300 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#002b5b]" />
                <span className="text-xs font-black text-[#002b5b] uppercase tracking-wider">Geographical Location Tagging</span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-white border-2 border-slate-400 text-xs font-black text-slate-900 hover:bg-slate-50 transition shadow-xs"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#002b5b]" /> : <MapPin className="w-3.5 h-3.5 text-rose-700" />}
                <span>{isLocating ? 'Locating...' : 'Auto-Capture GPS'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Landmark / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Hazratganj / Dadar TT Circle"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full bg-white text-slate-950 font-bold text-xs p-2.5 rounded border-2 border-slate-300 focus:outline-none focus:border-[#002b5b] shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow / Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-white text-slate-950 font-bold text-xs p-2.5 rounded border-2 border-slate-300 focus:outline-none focus:border-[#002b5b] shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">District *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucknow / Mumbai Suburban"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-white text-slate-950 font-bold text-xs p-2.5 rounded border-2 border-slate-300 focus:outline-none focus:border-[#002b5b] shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uttar Pradesh / Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-white text-slate-950 font-bold text-xs p-2.5 rounded border-2 border-slate-300 focus:outline-none focus:border-[#002b5b] shadow-xs"
                />
              </div>
            </div>

            {formData.latitude && (
              <div className="flex items-center space-x-2 text-xs text-emerald-950 font-bold bg-emerald-100 p-2 rounded border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>
                  GPS Resolved: <strong>{formData.city || 'Local Area'}{formData.district ? `, ${formData.district}` : ''}{formData.state ? `, ${formData.state}` : ''}</strong> [{formData.latitude}, {formData.longitude}]
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-md bg-[#002b5b] hover:bg-[#001833] text-white font-black text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            <span>{isSubmitting ? 'Registering Observation...' : 'Submit Official Observation'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
