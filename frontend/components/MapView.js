"use client";
import React, { useEffect, useRef } from 'react';

export default function MapView({ events = [], selectedArea, onSelectEvent }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let L;
    import('leaflet').then((leaflet) => {
      L = leaflet.default || leaflet;

      // 1. Initialize Map Instance
      if (!mapInstanceRef.current && mapContainerRef.current) {
        const initialLat = selectedArea?.lat || 20.5937;
        const initialLng = selectedArea?.lng || 78.9629;
        const initialZoom = selectedArea?.lat ? 10 : 5;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: initialZoom,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // 100% Free, Open, High-Resolution GIS Tiles (Zero API Key)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // 2. Clear Existing Event Markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }

      const allBounds = [];

      // 3. Pinpoint User / Selected Location Pin with Radar Glow Pulse
      if (selectedArea?.lat && selectedArea?.lng && !isNaN(selectedArea.lat) && !isNaN(selectedArea.lng)) {
        const userLat = parseFloat(selectedArea.lat);
        const userLng = parseFloat(selectedArea.lng);
        allBounds.push([userLat, userLng]);

        const userPinIcon = L.divIcon({
          className: 'user-gps-pulse-pin',
          html: `
            <div style="position: relative; width: 26px; height: 26px; display: flex; items-center; justify-content: center;">
              <div style="
                position: absolute;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background-color: rgba(2, 132, 199, 0.4);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #0284c7;
                border: 3px solid #ffffff;
                box-shadow: 0 0 10px rgba(2, 132, 199, 0.8);
                z-index: 10;
              "></div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const uMarker = L.marker([userLat, userLng], { icon: userPinIcon, zIndexOffset: 1000 }).addTo(map);
        uMarker.bindPopup(`
          <div style="font-family: -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
            <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; color: #0284c7; margin-bottom: 2px;">
              📍 TARGET LOCATION
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a;">
              ${selectedArea.district || selectedArea.city}, ${selectedArea.state}
            </div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 2px;">
              [${userLat.toFixed(4)}, ${userLng.toFixed(4)}]
            </div>
          </div>
        `);

        userMarkerRef.current = uMarker;

        // Fly map directly to selected location
        map.flyTo([userLat, userLng], 10, { duration: 1.2 });
      }

      // 4. Add High-Contrast Weather Incident Pins
      if (events && events.length > 0) {
        events.forEach((ev) => {
          if (ev.location?.coordinates && ev.location.coordinates.length === 2) {
            const [lng, lat] = ev.location.coordinates;
            allBounds.push([lat, lng]);

            const isCritical = ev.severity === 'CRITICAL' || ev.event_category === 'FLOODING';
            const markerBg = isCritical ? '#b91c1c' : (ev.severity === 'HIGH' ? '#ea580c' : '#002b5b');

            const customIcon = L.divIcon({
              className: 'custom-weather-pin',
              html: `
                <div style="
                  background-color: ${markerBg};
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                "></div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

            const popupContent = `
              <div style="font-family: -apple-system, sans-serif; font-size: 12px; max-width: 220px; color: #0f172a; padding: 4px;">
                <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #002b5b; margin-bottom: 3px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">
                  ${ev.event_category || 'WEATHER'} • ${ev.severity || 'ALERT'}
                </div>
                <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px; line-height: 1.3; color: #0f172a;">
                  ${ev.translated_text || ev.original_text || 'Observation report'}
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #475569;">
                  📍 ${ev.location?.landmark ? `${ev.location.landmark}, ` : ''}${ev.location?.city || 'India'}
                </div>
                ${ev.image_url ? `<img src="${ev.image_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-top: 6px; border: 1px solid #cbd5e1;" />` : ''}
              </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
              if (onSelectEvent) onSelectEvent(ev);
            });

            markersRef.current.push(marker);
          }
        });
      }
    });

    return () => {};
  }, [events, selectedArea]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-lg overflow-hidden border-2 border-slate-300 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
      
      {/* Overlay Status Badge */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-md border-2 border-slate-300 text-xs text-slate-900 font-bold flex items-center space-x-2 shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-[#002b5b] animate-pulse"></span>
        <span>
          {selectedArea?.district ? `Target: ${selectedArea.district}` : 'National Overview'} • {events.length} Live Incidents Pinpointed
        </span>
      </div>
    </div>
  );
}
