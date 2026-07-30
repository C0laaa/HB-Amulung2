import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface AdminDeliveryRouteMapProps {
  customerCoordinates: { lat: number; lng: number };
  customerName: string;
  distanceKm?: number;
  deliveryFee?: number;
}

const STORE_LOCATION = { lat: 17.850411430171594, lng: 121.7211948520295 }; // Zone 5, Calamagui, Amulung, Cagayan

export default function AdminDeliveryRouteMap({
  customerCoordinates,
  customerName,
  distanceKm,
  deliveryFee
}: AdminDeliveryRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const storeCoords: [number, number] = [STORE_LOCATION.lat, STORE_LOCATION.lng];
    const customerCoords: [number, number] = [customerCoordinates.lat, customerCoordinates.lng];

    // Create the map, centered around the midpoint of store and customer
    const midpoint: [number, number] = [
      (STORE_LOCATION.lat + customerCoordinates.lat) / 2,
      (STORE_LOCATION.lng + customerCoordinates.lng) / 2
    ];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(midpoint, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Custom icon for Honey Bakes Cafe Store
    const storeIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 border-2 border-stone-950 shadow-lg text-stone-950">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 12h1a3 3 0 0 1 0 6h-1"/></svg>
             </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Custom icon for Customer delivery destination
    const customerIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-stone-900 border-2 border-amber-500 shadow-lg text-amber-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add markers
    const storeMarker = L.marker(storeCoords, { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup('<strong class="font-bold">Honey Bakes Cafe</strong><br/><span class="text-xs text-stone-500">Dispatch Location</span>').openPopup();

    const customerMarker = L.marker(customerCoords, { icon: customerIcon }).addTo(map);
    customerMarker.bindPopup(`<strong class="font-bold">${customerName}</strong><br/><span class="text-xs text-stone-500">Delivery Point</span>`);

    // Draw route polyline with styled line
    const routeLine = L.polyline([storeCoords, customerCoords], {
      color: '#d97706', // amber-600
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.85
    }).addTo(map);

    // Fit map bounds to encompass both markers comfortably with padding
    map.fitBounds([storeCoords, customerCoords], {
      padding: [45, 45]
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerCoordinates, customerName]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
          Real-time Delivery Route Plot
        </span>
        {distanceKm && (
          <span className="text-[10.5px] bg-brand-gold/10 text-brand-dark px-2 py-0.5 rounded-full font-black border border-brand-gold/20">
            {distanceKm.toFixed(2)} km distance
          </span>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-sm">
        <div ref={mapContainerRef} className="w-full h-52 z-10" />
        
        {/* Route Details Overlay HUD */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-stone-200/80 z-20 flex justify-between items-center text-[10px] shadow-md">
          <div className="flex items-center gap-1.5 font-bold text-stone-700">
            <Compass className="w-3.5 h-3.5 text-stone-400" />
            <span>Store &rarr; Destination Route</span>
          </div>
          {deliveryFee && (
            <div className="text-right font-semibold">
              <span className="text-stone-400 text-[8px] uppercase tracking-widest block font-black leading-none">Computed Delivery Charge</span>
              <span className="text-brand-gold text-xs font-black">₱{deliveryFee} (₱50/km)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
