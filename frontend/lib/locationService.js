/**
 * 📍 Client-side Indian Location & Geocoding Service
 * Provides reverse-geocoding from GPS coordinates and forward-geocoding for search queries.
 */

// Major Indian Region Coordinates Lookup Table
const INDIAN_CITY_COORDINATES = {
  "mumbai": { lat: 19.0760, lng: 72.8777, city: "Mumbai", district: "Mumbai Suburban", state: "Maharashtra" },
  "delhi": { lat: 28.6139, lng: 77.2090, city: "New Delhi", district: "Central Delhi", state: "Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.2090, city: "New Delhi", district: "Central Delhi", state: "Delhi" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka" },
  "bangalore": { lat: 12.9716, lng: 77.5946, city: "Bengaluru", district: "Bengaluru Urban", state: "Karnataka" },
  "chennai": { lat: 13.0827, lng: 80.2707, city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, city: "Hyderabad", district: "Hyderabad", state: "Telangana" },
  "kolkata": { lat: 22.5726, lng: 88.3639, city: "Kolkata", district: "Kolkata", state: "West Bengal" },
  "pune": { lat: 18.5204, lng: 73.8567, city: "Pune", district: "Pune", state: "Maharashtra" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat" },
  "jaipur": { lat: 26.9124, lng: 75.7873, city: "Jaipur", district: "Jaipur", state: "Rajasthan" },
  "lucknow": { lat: 26.8467, lng: 80.9462, city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh" },
  "kanpur": { lat: 26.4499, lng: 80.3319, city: "Kanpur", district: "Kanpur Nagar", state: "Uttar Pradesh" },
  "varanasi": { lat: 25.3176, lng: 82.9739, city: "Varanasi", district: "Varanasi", state: "Uttar Pradesh" },
  "banaras": { lat: 25.3176, lng: 82.9739, city: "Varanasi", district: "Varanasi", state: "Uttar Pradesh" },
  "prayagraj": { lat: 25.4358, lng: 81.8463, city: "Prayagraj", district: "Prayagraj", state: "Uttar Pradesh" },
  "allahabad": { lat: 25.4358, lng: 81.8463, city: "Prayagraj", district: "Prayagraj", state: "Uttar Pradesh" },
  "agra": { lat: 27.1767, lng: 78.0081, city: "Agra", district: "Agra", state: "Uttar Pradesh" },
  "noida": { lat: 28.5355, lng: 77.3910, city: "Noida", district: "Gautam Buddha Nagar", state: "Uttar Pradesh" },
  "ghaziabad": { lat: 28.6692, lng: 77.4538, city: "Ghaziabad", district: "Ghaziabad", state: "Uttar Pradesh" },
  "gorakhpur": { lat: 26.7606, lng: 83.3732, city: "Gorakhpur", district: "Gorakhpur", state: "Uttar Pradesh" },
  "meerut": { lat: 28.9845, lng: 77.7064, city: "Meerut", district: "Meerut", state: "Uttar Pradesh" },
  "ayodhya": { lat: 26.7922, lng: 82.1998, city: "Ayodhya", district: "Ayodhya", state: "Uttar Pradesh" },
  "bareilly": { lat: 28.3670, lng: 79.4304, city: "Bareilly", district: "Bareilly", state: "Uttar Pradesh" },
  "mathura": { lat: 27.4924, lng: 77.6737, city: "Mathura", district: "Mathura", state: "Uttar Pradesh" },
  "patna": { lat: 25.5941, lng: 85.1376, city: "Patna", district: "Patna", state: "Bihar" },
  "bhopal": { lat: 23.2599, lng: 77.4126, city: "Bhopal", district: "Bhopal", state: "Madhya Pradesh" },
  "chandigarh": { lat: 30.7333, lng: 76.7794, city: "Chandigarh", district: "Chandigarh", state: "Chandigarh" },
  "kochi": { lat: 9.9312, lng: 76.2673, city: "Kochi", district: "Ernakulam", state: "Kerala" },
  "wayanad": { lat: 11.6854, lng: 76.1320, city: "Wayanad", district: "Wayanad", state: "Kerala" },
  "guwahati": { lat: 26.1445, lng: 91.7362, city: "Guwahati", district: "Kamrup Metropolitan", state: "Assam" },
  "golaghat": { lat: 26.5167, lng: 93.9667, city: "Golaghat", district: "Golaghat", state: "Assam" },
  "dehradun": { lat: 30.3165, lng: 78.0322, city: "Dehradun", district: "Dehradun", state: "Uttarakhand" },
  "shimla": { lat: 31.1048, lng: 77.1734, city: "Shimla", district: "Shimla", state: "Himachal Pradesh" },
  "srinagar": { lat: 34.0837, lng: 74.7973, city: "Srinagar", district: "Srinagar", state: "Jammu and Kashmir" },
  "ranchi": { lat: 23.3441, lng: 85.3096, city: "Ranchi", district: "Ranchi", state: "Jharkhand" },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245, city: "Bhubaneswar", district: "Khordha", state: "Odisha" },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366, city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala" },
  "nagpur": { lat: 21.1458, lng: 79.0882, city: "Nagpur", district: "Nagpur", state: "Maharashtra" },
  "surat": { lat: 21.1702, lng: 72.8311, city: "Surat", district: "Surat", state: "Gujarat" },
  "visakhapatnam": { lat: 17.6868, lng: 83.2185, city: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh" }
};

/**
 * Reverse Geocode GPS coordinates into Indian District, City & State
 */
export async function reverseGeocodeGPS(lat, lng) {
  const numericLat = parseFloat(lat);
  const numericLng = parseFloat(lng);

  // 1. Query OpenStreetMap Free Reverse Geocoder (Detailed address components)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${numericLat}&lon=${numericLng}&format=json&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(3500)
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || "Detected Location";
      const district = addr.state_district || addr.county || addr.district || city;
      const state = addr.state || "India";
      const landmark = addr.road || addr.neighbourhood || addr.suburb || data.name || (city !== "Detected Location" ? `${city} Locality` : "GPS Location");

      return {
        state,
        district,
        city,
        landmark,
        lat: numericLat,
        lng: numericLng
      };
    }
  } catch (err) {
    console.warn('[GEOCODER] Nominatim timeout or CORS:', err.message);
  }

  // 2. Query BigDataCloud Client Reverse Geocoder (High-speed free fallback)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${numericLat}&longitude=${numericLng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(3500) }
    );

    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const city = bdcData.locality || bdcData.city || "Detected City";
      const state = bdcData.principalSubdivision || "India";
      const district = bdcData.localityInfo?.administrative?.[2]?.name || bdcData.localityInfo?.administrative?.[1]?.name || city;
      const landmark = bdcData.locality || `${city} Area`;

      return {
        state,
        district,
        city,
        landmark,
        lat: numericLat,
        lng: numericLng
      };
    }
  } catch (err) {
    console.warn('[GEOCODER] BigDataCloud fallback error:', err.message);
  }

  // 3. Proximity Matching against Indian Cities Table
  let closest = null;
  let minDistance = Infinity;

  for (const info of Object.values(INDIAN_CITY_COORDINATES)) {
    const d = Math.hypot(info.lat - numericLat, info.lng - numericLng);
    if (d < minDistance) {
      minDistance = d;
      closest = info;
    }
  }

  if (closest && minDistance < 3.0) { // Within ~300 km
    return {
      state: closest.state,
      district: closest.district,
      city: closest.city,
      landmark: `${closest.city} Sector`,
      lat: numericLat,
      lng: numericLng
    };
  }

  return {
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    landmark: "Field Area",
    lat: numericLat,
    lng: numericLng
  };
}

/**
 * Multi-Tier User Geolocation Resolver
 * 1. Tries Browser GPS (low accuracy for instant desktop/laptop Wifi resolution)
 * 2. If GPS fails or is denied or times out, immediately falls back to IP Geolocation (ipwho.is)
 * 3. Reverse-geocodes coordinates into exact Landmark, City, District & State
 */
export async function getUserCurrentLocation() {
  // Step 1: Attempt Browser GPS with low-accuracy fast timeout
  const getBrowserGPS = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve(null);
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.warn('[LOCATION] Browser GPS unavailable or timed out:', err.message);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 }
      );
    });
  };

  let coords = null;
  try {
    coords = await getBrowserGPS();
  } catch {
    coords = null;
  }

  // Step 2: Fallback to IP Geolocation if browser GPS is unavailable/denied
  if (!coords) {
    try {
      console.log('[LOCATION] Fetching location via IP Geolocation fallback (ipwho.is)...');
      const ipRes = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.success && ipData.latitude && ipData.longitude) {
          coords = {
            lat: ipData.latitude,
            lng: ipData.longitude,
            ipCity: ipData.city,
            ipState: ipData.region
          };
        }
      }
    } catch (ipErr) {
      console.warn('[LOCATION] ipwho.is failed, trying ipapi.co:', ipErr.message);
    }
  }

  // Step 3: Secondary IP fallback
  if (!coords) {
    try {
      const ipRes2 = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      if (ipRes2.ok) {
        const ipData2 = await ipRes2.json();
        if (ipData2.latitude && ipData2.longitude) {
          coords = {
            lat: ipData2.latitude,
            lng: ipData2.longitude,
            ipCity: ipData2.city,
            ipState: ipData2.region
          };
        }
      }
    } catch (err2) {
      console.warn('[LOCATION] Secondary IP service failed:', err2.message);
    }
  }

  // Final fallback to Lucknow, UP default coordinates if completely offline
  const lat = coords?.lat || 26.8467;
  const lng = coords?.lng || 80.9462;

  // Step 4: Reverse Geocode the coordinates into District, City & State
  const resolved = await reverseGeocodeGPS(lat, lng);

  // If IP geolocation provided a city/state and reverse geocoder returned fallback, merge IP data
  if (coords?.ipCity && (!resolved.city || resolved.city === 'Detected Location' || resolved.city === 'Local Area')) {
    resolved.city = coords.ipCity;
  }
  if (coords?.ipState && (!resolved.state || resolved.state === 'India')) {
    resolved.state = coords.ipState;
  }
  if (!resolved.district || resolved.district === 'My Location') {
    resolved.district = resolved.city;
  }

  return {
    ...resolved,
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
}

/**
 * Forward Geocode Search Query to Coordinates & Territory Info
 */
export async function forwardGeocodeSearch(query) {
  if (!query || !query.trim()) return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct match in local dictionary
  for (const [key, val] of Object.entries(INDIAN_CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { ...val };
    }
  }

  // 2. Query OpenStreetMap Nominatim for Indian Territories
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&addressdetails=1&limit=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(4000)
      }
    );

    if (res.ok) {
      const results = await res.json();
      if (results && results.length > 0) {
        const item = results[0];
        const addr = item.address || {};
        return {
          state: addr.state || "India",
          district: addr.state_district || addr.county || addr.city || query,
          city: addr.city || addr.town || addr.village || query,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      }
    }
  } catch (err) {
    console.warn('[GEOCODER] Forward search error:', err.message);
  }

  return {
    state: "India",
    district: query,
    city: query,
    lat: 20.5937,
    lng: 78.9629
  };
}
