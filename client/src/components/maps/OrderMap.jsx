import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "../../components/maps/fixLeafletIcons.js";

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

export default function OrderMap({ userLatLng, courierLatLng, height=340 }) {
  const center = useMemo(() => {
    if (courierLatLng) return courierLatLng;
    if (userLatLng) return userLatLng;
    return [12.9716, 77.5946];
  }, [courierLatLng, userLatLng]);

  const mapbox = import.meta.env.VITE_MAPBOX_TOKEN || "";
  const useMapbox = Boolean(mapbox);

  const tile = useMemo(() => {
    if (useMapbox) {
      return {
        url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${mapbox}`,
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      };
    }
    // ✅ Default fallback (OSM)
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };
  }, [useMapbox, mapbox]);

  const bounds = useMemo(() => {
    if (!userLatLng || !courierLatLng) return null;
    const [aLat,aLng] = userLatLng;
    const [bLat,bLng] = courierLatLng;
    return [
      [clamp(Math.min(aLat,bLat)-0.02, -90, 90), clamp(Math.min(aLng,bLng)-0.02, -180, 180)],
      [clamp(Math.max(aLat,bLat)+0.02, -90, 90), clamp(Math.max(aLng,bLng)+0.02, -180, 180)],
    ];
  }, [userLatLng, courierLatLng]);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-slate-100">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        bounds={bounds || undefined}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />

        {userLatLng && (
          <Marker position={userLatLng}>
            <Popup>Delivery Address</Popup>
          </Marker>
        )}

        {courierLatLng && (
          <Marker position={courierLatLng}>
            <Popup>Courier</Popup>
          </Marker>
        )}

        {userLatLng && courierLatLng && (
          <Polyline positions={[courierLatLng, userLatLng]} />
        )}
      </MapContainer>
    </div>
  );
}
