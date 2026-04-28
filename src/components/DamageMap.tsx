import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix default marker assets in Vite
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const FlyTo = ({ position, zoom = 17 }: { position: [number, number] | null; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 1.2 });
    }
  }, [position?.[0], position?.[1], zoom, map]);
  return null;
};

export type RepairMaterial = {
  name: string;
  quantity: string;
  unit_price: number;
  subtotal: number;
};

export type RepairEstimate = {
  materials: RepairMaterial[];
  labor_cost: number;
  total_cost: number;
  duration: string;
  method: string;
};

export type Report = {
  id: string;
  photo_url: string;
  severity: string;
  estimated_area: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  created_at: string;
  repair_estimate?: RepairEstimate | null;
};

const severityColor = (s: string) => {
  if (s === "Berat") return "#ef4444";
  if (s === "Sedang") return "#f59e0b";
  return "#10b981";
};

const makeIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:3px solid #1F2937;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

export const DamageMap = ({
  reports,
  focus,
}: {
  reports: Report[];
  focus?: { lat: number; lng: number } | null;
}) => {
  const center: [number, number] = focus
    ? [focus.lat, focus.lng]
    : reports.length > 0
      ? [reports[0].latitude, reports[0].longitude]
      : [-6.2088, 106.8456]; // Jakarta default

  return (
    <MapContainer
      center={center}
      zoom={focus ? 17 : 12}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo position={focus ? [focus.lat, focus.lng] : null} />
      {focus && (
        <>
          <Circle
            center={[focus.lat, focus.lng]}
            radius={30}
            pathOptions={{ color: "#FBBF24", fillColor: "#FBBF24", fillOpacity: 0.25 }}
          />
          <Marker position={[focus.lat, focus.lng]} icon={makeIcon("#FBBF24")}>
            <Popup>Lokasi Anda saat ini</Popup>
          </Marker>
        </>
      )}
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.latitude, r.longitude]}
          icon={makeIcon(severityColor(r.severity))}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <div className="font-bold text-secondary">Tingkat: {r.severity}</div>
              <div className="text-muted-foreground">{r.estimated_area}</div>
              <img src={r.photo_url} alt="damage" className="mt-1 h-24 w-full rounded object-cover" />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
