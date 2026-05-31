"use client";
import dynamic from "next/dynamic";

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

const PropertyMapClient = dynamic(() => import("@/components/property-map-client"), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm">Loading map...</div>,
});

export function MapWrapper({ properties, center }: { properties: MapProperty[]; center?: [number, number] }) {
  return <PropertyMapClient properties={properties} center={center} />;
}
