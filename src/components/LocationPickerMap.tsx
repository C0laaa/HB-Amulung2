import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Locate, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Search } from 'lucide-react';

interface LocationPickerMapProps {
  address: string;
  onChangeAddress: (newAddress: string) => void;
  onVerificationStatus: (isValid: boolean) => void;
  onChangeCoordinates?: (lat: number, lng: number) => void;
}

// Center of Amulung (Store Location: Zone 5, Calamagui, Amulung, Cagayan)
const AMULUNG_CENTER = { lat: 17.850411430171594, lng: 121.7211948520295 };

// Official list of 6 approved delivery barangays of Amulung, Cagayan
export const AMULUNG_DELIVERY_BARANGAYS = [
  "Calamagui",
  "Estefania",
  "Conception",
  "Anquiray",
  "Centro",
  "Baculud"
];

// Delivery Barangays only
export const AMULUNG_BARANGAYS = [
  "Calamagui",
  "Estefania",
  "Conception",
  "Anquiray",
  "Centro",
  "Baculud"
];

export default function LocationPickerMap({
  address,
  onChangeAddress,
  onVerificationStatus,
  onChangeCoordinates
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [streetDetails, setStreetDetails] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'idle' | 'success' | 'warning' | 'error';
  }>({ text: 'Select your Barangay and specify your Street/Zone above to set your delivery spot.', type: 'idle' });

  // Load leaflet safely from global scope
  const getLeaflet = () => {
    return (window as any).L;
  };

  // Sync internal state with external address prop
  useEffect(() => {
    if (!address) {
      setSelectedBarangay('');
      setStreetDetails('');
      return;
    }

    const addressLower = address.toLowerCase();
    
    // Find matching barangay from our official list
    const foundBrgy = AMULUNG_BARANGAYS.find(brgy => 
      addressLower.includes(brgy.toLowerCase())
    );

    if (foundBrgy) {
      setSelectedBarangay(foundBrgy);
      
      // Extract street/house details
      const parts = address.split(',').map(p => p.trim());
      const nonAddrParts = parts.filter(part => {
        const pLower = part.toLowerCase();
        return (
          pLower !== foundBrgy.toLowerCase() &&
          pLower !== 'amulung' &&
          pLower !== 'cagayan' &&
          pLower !== 'philippines' &&
          pLower !== 'ph'
        );
      });
      setStreetDetails(nonAddrParts.join(', '));
    } else {
      setStreetDetails(address);
    }
  }, [address]);

  // Combine and propagate changes upward
  const handleAddressChange = (brgy: string, street: string) => {
    const parts = [];
    if (street.trim()) parts.push(street.trim());
    if (brgy) parts.push(brgy);
    parts.push("Amulung", "Cagayan");
    
    const combined = parts.join(', ');
    if (combined !== address) {
      onChangeAddress(combined);
    }
  };

  const handleBarangaySelect = async (brgy: string) => {
    setSelectedBarangay(brgy);
    handleAddressChange(brgy, streetDetails);
    
    if (brgy) {
      setLoading(true);
      setStatusMessage({ text: `Locating ${brgy} on the map...`, type: 'idle' });
      try {
        const query = `${brgy}, Amulung, Cagayan, Philippines`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'HoneyBakesCafeMenu/1.0'
            }
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
            markerRef.current.setLatLng([latitude, longitude]);
            onChangeCoordinates?.(latitude, longitude);
            onVerificationStatus(true);
            setStatusMessage({
              text: `📍 Centered on ${brgy}. Drag the pin to your exact street, zone, or house!`,
              type: 'success'
            });
          }
        } else {
          setStatusMessage({
            text: `Centered on ${brgy}. Please use the map controls or drag the pin.`,
            type: 'success'
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStreetChange = (val: string) => {
    setStreetDetails(val);
    handleAddressChange(selectedBarangay, val);
  };

  useEffect(() => {
    const L = getLeaflet();
    if (!L || !mapContainerRef.current) return;

    // To prevent multiple maps being initialized on the same container
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Custom map pin icon with Honey Bakes theme (Dark Slate background & Gold accent)
    const pinIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-stone-900 border-2 border-amber-500 shadow-lg text-amber-400 animate-bounce">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false // Disable default zoom control so we can make a custom mobile-friendly interface
    }).setView([AMULUNG_CENTER.lat, AMULUNG_CENTER.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>'
    }).addTo(map);

    // Add zoom control at bottom-right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Create marker
    const marker = L.marker([AMULUNG_CENTER.lat, AMULUNG_CENTER.lng], {
      draggable: true,
      icon: pinIcon
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      reverseGeocode(position.lat, position.lng);
    });

    // Handle map click
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Reverse Geocoding using Nominatim API (Free open-source OSM geocoding)
  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    setStatusMessage({ text: 'Verifying pinned coordinates...', type: 'idle' });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'HoneyBakesCafeMenu/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Geocoding service unavailable');

      const data = await response.json();
      const addr = data.address || {};
      
      // Determine barangay, town and province
      const displayName = data.display_name || '';
      const barangay = addr.village || addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.hamlet || '';
      const road = addr.road || '';
      const municipality = addr.municipality || addr.town || addr.city || '';

      // Helper to calculate distance in km from the store
      const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const distanceToStore = getDistanceInKm(lat, lng, AMULUNG_CENTER.lat, AMULUNG_CENTER.lng);

      // Check for direct Amulung mentions
      const mentionsAmulung = 
        displayName.toLowerCase().includes('amulung') || 
        (addr.municipality && addr.municipality.toLowerCase().includes('amulung')) ||
        (addr.town && addr.town.toLowerCase().includes('amulung')) ||
        (addr.village && addr.village.toLowerCase().includes('amulung')) ||
        (addr.city && addr.city.toLowerCase().includes('amulung')) ||
        (addr.suburb && addr.suburb.toLowerCase().includes('amulung'));

      // Check if geocoded address or displayName mentions any Amulung barangays
      const mentionsAmulungBarangay = AMULUNG_BARANGAYS.some(brgy => {
        const bLower = brgy.toLowerCase();
        return (
          displayName.toLowerCase().includes(bLower) ||
          (addr.village && addr.village.toLowerCase().includes(bLower)) ||
          (addr.suburb && addr.suburb.toLowerCase().includes(bLower)) ||
          (addr.neighbourhood && addr.neighbourhood.toLowerCase().includes(bLower)) ||
          (addr.hamlet && addr.hamlet.toLowerCase().includes(bLower)) ||
          (addr.city_district && addr.city_district.toLowerCase().includes(bLower))
        );
      });

      // Is the point inside Cagayan province or immediate region?
      const isInCagayan = 
        displayName.toLowerCase().includes('cagayan') || 
        (addr.province && addr.province.toLowerCase().includes('cagayan')) ||
        (addr.state && addr.state.toLowerCase().includes('cagayan')) ||
        (addr.county && addr.county.toLowerCase().includes('cagayan')) ||
        displayName.toLowerCase().includes('cagayan valley');

      // Helper to identify explicit mentions of other cities/municipalities to reject them
      const otherCitiesAndProvinces = [
        'tuguegarao', 'iguig', 'alcala', 'solana', 'baggao', 'peñablanca', 'penablanca', 'gattaran',
        'tuao', 'piat', 'enrile', 'lal-lo', 'lallo', 'aparri', 'camalaniugan', 'buguey', 'claveria',
        'sanchez', 'ballesteros', 'allacapan', 'lasam', 'rizal', 'sto. nino', 'sto. niño', 'santo niño',
        'santo nino', 'pamplona', 'gonzaga', 'santa ana', 'sta. ana', 'isabela', 'ilocos', 'kalinga',
        'apayao', 'nueva vizcaya', 'quirino', 'batanes', 'manila'
      ];

      const mentionsOtherArea = otherCitiesAndProvinces.some(city => {
        const cLower = city.toLowerCase();
        return (
          displayName.toLowerCase().includes(cLower) ||
          (addr.municipality && addr.municipality.toLowerCase().includes(cLower)) ||
          (addr.town && addr.town.toLowerCase().includes(cLower)) ||
          (addr.city && addr.city.toLowerCase().includes(cLower)) ||
          (addr.county && addr.county.toLowerCase().includes(cLower)) ||
          (addr.state && addr.state.toLowerCase().includes(cLower)) ||
          (addr.province && addr.province.toLowerCase().includes(cLower))
        );
      });

      // We consider it verified inside Amulung if:
      // 1. It is within a strict 15.5 km radius from Amulung Center
      // 2. It is inside Cagayan Province
      // 3. It does NOT belong to any neighboring or external cities/municipalities
      // 4. Either it explicitly mentions Amulung, OR is an Amulung Barangay, OR the user selected a valid Barangay and is placing the pin within range
      const isAmulung = 
        !mentionsOtherArea &&
        isInCagayan &&
        distanceToStore <= 15.5 &&
        (mentionsAmulung || mentionsAmulungBarangay || selectedBarangay);
      
      if (isAmulung) {
        // Match against our official barangay list
        let matchedBarangay = '';
        const allText = `${barangay} ${displayName}`.toLowerCase();
        for (const brgy of AMULUNG_BARANGAYS) {
          if (allText.includes(brgy.toLowerCase())) {
            matchedBarangay = brgy;
            break;
          }
        }

        const finalBarangay = matchedBarangay || barangay || selectedBarangay || 'Centro East';
        const finalStreet = road || streetDetails || '';

        setSelectedBarangay(finalBarangay);
        setStreetDetails(finalStreet);

        const parts = [];
        if (finalStreet) parts.push(finalStreet);
        if (finalBarangay) parts.push(finalBarangay);
        parts.push("Amulung", "Cagayan");
        const realAddress = parts.join(', ');

        onChangeAddress(realAddress);
        onVerificationStatus(true);
        onChangeCoordinates?.(lat, lng);
        setStatusMessage({
          text: `Verified: Location pinned inside Amulung (${finalBarangay}).`,
          type: 'success'
        });
      } else {
        // Outside Amulung
        const fallbackParts = [];
        if (road) fallbackParts.push(road);
        if (barangay) fallbackParts.push(barangay);
        if (municipality) fallbackParts.push(municipality);
        const fallbackAddress = fallbackParts.join(', ');

        onChangeAddress(fallbackAddress);
        onVerificationStatus(false);
        onChangeCoordinates?.(lat, lng);
        setStatusMessage({
          text: `⚠️ Location is outside Amulung Municipality (${municipality || 'Outside Area'}). We only deliver strictly within Amulung boundaries!`,
          type: 'warning'
        });
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setStatusMessage({
        text: 'Could not connect to map service. Please choose your Barangay from the dropdown.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get current device location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage({
        text: 'Geolocation is not supported by your browser or device.',
        type: 'error'
      });
      return;
    }

    setGpsLoading(true);
    setStatusMessage({ text: 'Accessing GPS location settings...', type: 'idle' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const L = getLeaflet();

        if (mapInstanceRef.current && markerRef.current) {
          // Pan map to user's location and set marker
          mapInstanceRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          
          // Reverse geocode the new position
          reverseGeocode(latitude, longitude);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS Geolocation error:', error);
        setGpsLoading(false);
        
        let errorMsg = 'Failed to retrieve your location. Please check your browser location permissions.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'GPS Access Denied. Please enable location permissions in your browser/phone settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location signal unavailable. Try moving to an open space or pin manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'GPS location retrieval timed out. Please drag the pin on the map instead.';
        }
        
        setStatusMessage({
          text: errorMsg,
          type: 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-2.5 mt-1" id="location-map-picker-root">
      
      {/* Single input for Street Details / Landmark */}
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">
          Street / Zone / Landmark
        </label>
        <input
          type="text"
          value={streetDetails}
          onChange={(e) => handleStreetChange(e.target.value)}
          placeholder="e.g., Zone 5, near school, Calamagui"
          className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-brand-gold focus:bg-white text-brand-dark placeholder:text-stone-400 font-semibold transition-all"
        />
      </div>

      {/* Map Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading || loading}
          className="flex-1 py-1.5 px-3 bg-brand-dark hover:bg-stone-800 text-brand-yellow font-bold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-stone-800 active:scale-95 disabled:opacity-50"
        >
          {gpsLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Locate className="w-3 h-3" />
          )}
          {gpsLoading ? 'Locating Device...' : 'Use My GPS Location'}
        </button>
      </div>

      {/* Embedded Map Element */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
        <div 
          ref={mapContainerRef} 
          style={{ height: '170px', width: '100%' }}
          className="z-10 relative"
        />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <div className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-stone-800 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Verifying location...</span>
            </div>
          </div>
        )}

        {/* Map UI Overlay hints */}
        <div className="absolute bottom-2 left-2 z-20 bg-stone-900/90 text-[8.5px] text-white font-bold py-1 px-2 rounded-lg backdrop-blur-xs border border-stone-800 pointer-events-none shadow-md">
          👆 Tap map or drag pin to adjust delivery spot
        </div>
      </div>

      {/* Location Status Message Indicator */}
      <div className={`p-2 rounded-xl border text-[10px] font-semibold leading-normal flex items-start gap-1.5 ${
        statusMessage.type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : statusMessage.type === 'warning'
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : statusMessage.type === 'error'
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-stone-50 border-stone-200 text-stone-600'
      }`}>
        {statusMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />}
        {statusMessage.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />}
        {statusMessage.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />}
        {statusMessage.type === 'idle' && <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-stone-500 mt-0.5" />}
        <span>{statusMessage.text}</span>
      </div>
    </div>
  );
}

