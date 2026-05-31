"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

type MapProperty = {
  id: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  propertyType: string;
  status: string;
  askingPrice?: number | null;
  soldPrice?: number | null;
  capRate?: number | null;
  buildingSize: number;
};

const TYPE_COLOR: Record<string, string> = {
  INDUSTRIAL: "#334155",
  OFFICE: "#2563eb",
  RETAIL: "#7c3aed",
  MULTIFAMILY: "#16a34a",
  MIXED_USE: "#d97706",
};

function createIcon(type: string, sold: boolean) {
  const color = sold ? "#94a3b8" : (TYPE_COLOR[type] ?? "#2563eb");
  const letter = type[0];
  return L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
      <span style="transform:rotate(45deg);color:white;font-weight:900;font-size:11px;">${letter}</span>
    </div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

export default function PropertyMapClient({ properties, center = [43.6532, -79.3832] as [number, number] }: { properties: MapProperty[]; center?: [number, number] }) {
  const initialized = useRef(false);
  useEffect(() => { initialized.current = true; }, []);

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <RecenterMap center={center} />
      {properties.map((p) => {
        const price = p.status === "SOLD" ? p.soldPrice : p.askingPrice;
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createIcon(p.propertyType, p.status === "SOLD")}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.address}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{p.city}</div>
                <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Price</div>
                    <div style={{ fontWeight: 700 }}>{price ? fmt(price) : "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Cap Rate</div>
                    <div style={{ fontWeight: 700 }}>{p.capRate ? `${(p.capRate * 100).toFixed(1)}%` : "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Size</div>
                    <div style={{ fontWeight: 700 }}>{p.buildingSize.toLocaleString()} sf</div>
                  </div>
                </div>
                <a
                  href={`/properties/${p.id}`}
                  style={{ display: "block", textAlign: "center", background: "#2563eb", color: "white", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
