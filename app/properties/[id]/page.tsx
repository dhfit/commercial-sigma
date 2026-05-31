import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SaveButton } from "@/components/save-button";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { InvestmentCalculator } from "@/components/investment-calculator";
import { MapWrapper as MiniMap } from "@/components/map-wrapper";

type Props = { params: Promise<{ id: string }> };

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

const TYPE_LABELS: Record<string, string> = {
  INDUSTRIAL: "Industrial", OFFICE: "Office", RETAIL: "Retail",
  MULTIFAMILY: "Multifamily", MIXED_USE: "Mixed-Use", LAND: "Land",
};
const LEASE_LABELS: Record<string, string> = {
  TRIPLE_NET: "Triple Net (NNN)", GROSS: "Gross Lease", MODIFIED_GROSS: "Modified Gross", PERCENTAGE: "Percentage Rent",
};

function ExpiryRisk({ date }: { date: Date | null }) {
  if (!date) return null;
  const months = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
  const color = months < 12 ? "text-red-600 bg-red-50 border-red-200" : months < 24 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-green-600 bg-green-50 border-green-200";
  const label = months < 0 ? "EXPIRED" : months < 12 ? `${months}mo remaining` : months < 24 ? `${months}mo remaining` : `${Math.floor(months / 12)}yr ${months % 12}mo remaining`;
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${color}`}>{label}</span>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      tenants: { orderBy: { squareFeet: "desc" } },
      priceHistory: { orderBy: { date: "asc" } },
    },
  });

  if (!property) notFound();

  const comps = await prisma.property.findMany({
    where: {
      id: { not: id },
      city: property.city,
      propertyType: property.propertyType,
      status: "SOLD",
      soldDate: { gte: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000) },
      buildingSize: { gte: property.buildingSize * 0.65, lte: property.buildingSize * 1.35 },
    },
    take: 4,
    orderBy: { soldDate: "desc" },
  });

  const price = property.status === "SOLD" ? property.soldPrice : property.askingPrice;
  const highlights = property.highlights ? JSON.parse(property.highlights) as string[] : [];
  const mapProps = [{ id: property.id, address: property.address, city: property.city, lat: property.lat, lng: property.lng, propertyType: property.propertyType, status: property.status, askingPrice: property.askingPrice, soldPrice: property.soldPrice, capRate: property.capRate, buildingSize: property.buildingSize }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link href="/properties" className="hover:text-blue-600">Properties</Link>
        <span>/</span>
        <Link href={`/properties?city=${property.city}`} className="hover:text-blue-600">{property.city}</Link>
        <span>/</span>
        <span className="text-slate-600 truncate">{property.address}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {TYPE_LABELS[property.propertyType] ?? property.propertyType}
                  </span>
                  {property.propertySubtype && (
                    <span className="text-xs text-slate-400">{property.propertySubtype}</span>
                  )}
                  {property.status === "SOLD" ? (
                    <span className="text-xs font-bold bg-slate-800 text-white px-2.5 py-1 rounded-full">SOLD</span>
                  ) : (
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">FOR SALE</span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-slate-900">{property.address}</h1>
                <p className="text-slate-500 mt-1">{property.neighborhood ? `${property.neighborhood}, ` : ""}{property.city}, {property.province} {property.postalCode ?? ""}</p>
                {property.submarket && <p className="text-xs text-slate-400 mt-1">{property.submarket} submarket</p>}
              </div>
              <SaveButton propertyId={property.id} />
            </div>

            {/* Price */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-black text-slate-900">
                  {price ? fmt(price) : "Price on Request"}
                </div>
                {property.pricePerSqFt && (
                  <div className="text-slate-400 text-sm">${property.pricePerSqFt.toFixed(0)}/sqft</div>
                )}
              </div>
              {property.status === "SOLD" && property.askingPrice && property.soldPrice && (
                <div className="text-sm text-slate-400 mt-1">
                  Listed at {fmt(property.askingPrice)} •{" "}
                  <span className={property.soldPrice < property.askingPrice ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {property.soldPrice < property.askingPrice
                      ? `Sold ${((1 - property.soldPrice / property.askingPrice) * 100).toFixed(1)}% below ask`
                      : `Sold ${((property.soldPrice / property.askingPrice - 1) * 100).toFixed(1)}% above ask`}
                  </span>
                </div>
              )}
              {property.status === "SOLD" && property.soldDate && (
                <div className="text-sm text-slate-400 mt-0.5">
                  Sold {new Date(property.soldDate).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                  {property.daysOnMarket && ` after ${property.daysOnMarket} days on market`}
                </div>
              )}
              {property.listingBrokerage && (
                <div className="text-xs text-slate-400 mt-1">Listed by {property.listingBrokerage}</div>
              )}
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Financial Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Cap Rate", value: property.capRate ? `${(property.capRate * 100).toFixed(2)}%` : "—", highlight: !!property.capRate && property.capRate > 0.06, note: "NOI / Price" },
                { label: "Net Operating Income", value: property.noi ? fmt(property.noi) : "—", note: "Annual" },
                { label: "Gross Revenue", value: property.grossRevenue ? fmt(property.grossRevenue) : "—", note: "Annual" },
                { label: "GRM", value: property.grm ? property.grm.toFixed(1) : property.grossRevenue && price ? (price / property.grossRevenue).toFixed(1) : "—", note: "Gross Rent Multiplier" },
              ].map((m) => (
                <div key={m.label} className={`rounded-xl p-4 ${m.highlight ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-100"}`}>
                  <div className="text-xs text-slate-400 font-medium mb-1">{m.label}</div>
                  <div className={`text-2xl font-black ${m.highlight ? "text-green-700" : "text-slate-900"}`}>{m.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.note}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Operating Expenses", value: property.operatingExpenses ? fmt(property.operatingExpenses) : "—", note: "Annual" },
                { label: "Vacancy Rate", value: property.vacancyRate !== null && property.vacancyRate !== undefined ? `${(property.vacancyRate * 100).toFixed(0)}%` : "—", note: "Current" },
                { label: "Annual Property Tax", value: property.taxesAnnual ? fmt(property.taxesAnnual) : "—", note: "Estimated" },
                { label: "Price/SqFt", value: property.pricePerSqFt ? `$${property.pricePerSqFt.toFixed(0)}` : "—", note: "Building area" },
              ].map((m) => (
                <div key={m.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">{m.label}</div>
                  <div className="text-xl font-black text-slate-900">{m.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Property Details</h2>
            {property.description && (
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{property.description}</p>
            )}
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {highlights.map((h: string) => (
                  <span key={h} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-medium">✓ {h}</span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {[
                ["Building Size", `${property.buildingSize.toLocaleString()} sq ft`],
                ["Lot Size", property.lotSize ? `${property.lotSize.toLocaleString()} sq ft` : "—"],
                ["Year Built", property.yearBuilt ? String(property.yearBuilt) : "—"],
                ["Floors", property.numFloors ? String(property.numFloors) : "—"],
                ["Zoning", property.zoning ?? "—"],
                ["Parking", property.parkingSpaces ? `${property.parkingSpaces} stalls` : "—"],
                ...(property.propertyType === "INDUSTRIAL" ? [
                  ["Loading Docks", property.loadingDocks ? `${property.loadingDocks} truck-level` : "—"],
                  ["Clear Height", property.clearHeight ? `${property.clearHeight} feet` : "—"],
                ] : []),
                ...(property.propertyType === "MULTIFAMILY" ? [
                  ["Units", property.numUnits ? `${property.numUnits} suites` : "—"],
                ] : []),
                ["Days on Market", property.daysOnMarket ? `${property.daysOnMarket} days` : "—"],
                ["MLS #", property.mlsNumber ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                  <span className="text-slate-400 font-medium">{label}</span>
                  <span className="text-slate-900 font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant Roster */}
          {property.tenants.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Tenant Roster</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{property.tenants.length} {property.tenants.length === 1 ? "tenant" : "tenants"}</span>
              </div>
              <div className="space-y-3">
                {property.tenants.map((t) => (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="font-bold text-slate-900">{t.name}</div>
                        {t.industry && <div className="text-xs text-slate-400 mt-0.5">{t.industry}</div>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {t.creditRating && (
                          <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold">{t.creditRating}</span>
                        )}
                        {t.leaseExpiry && <ExpiryRisk date={t.leaseExpiry} />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-400">Lease Type</div>
                        <div className="font-semibold text-slate-800">{t.leaseType ? (LEASE_LABELS[t.leaseType] ?? t.leaseType) : "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Space</div>
                        <div className="font-semibold text-slate-800">{t.squareFeet ? `${t.squareFeet.toLocaleString()} sf` : "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Rent</div>
                        <div className="font-semibold text-slate-800">{t.rentPerSqFt ? `$${t.rentPerSqFt}/sf/yr` : "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Lease Expires</div>
                        <div className="font-semibold text-slate-800">{t.leaseExpiry ? new Date(t.leaseExpiry).toLocaleDateString("en-CA", { month: "short", year: "numeric" }) : "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price History */}
          {property.priceHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Price History</h2>
              <PriceHistoryChart history={property.priceHistory} />
              <div className="mt-4 space-y-2">
                {[...property.priceHistory].reverse().map((ph) => (
                  <div key={ph.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ph.priceType === "SOLD" ? "bg-slate-800 text-white" : ph.priceType === "PRICE_CHANGE" ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                        {ph.priceType.replace("_", " ")}
                      </span>
                      <span className="text-slate-400">{new Date(ph.date).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="font-bold text-slate-900">{fmt(ph.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparable Sales */}
          {comps.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Comparable Sales</h2>
              <p className="text-xs text-slate-400 mb-4">Similar {TYPE_LABELS[property.propertyType] ?? ""} properties sold in {property.city} within 18 months</p>
              <div className="space-y-3">
                {comps.map((c) => (
                  <Link key={c.id} href={`/properties/${c.id}`} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{c.address}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {c.buildingSize.toLocaleString()} sf • {c.soldDate ? new Date(c.soldDate).toLocaleDateString("en-CA", { month: "short", year: "numeric" }) : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900">{c.soldPrice ? fmt(c.soldPrice) : "—"}</div>
                      <div className="text-xs text-slate-400">{c.capRate ? `${(c.capRate * 100).toFixed(1)}% cap` : ""}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Location</h2>
            <div className="h-72 rounded-xl overflow-hidden">
              <MiniMap properties={mapProps} center={[property.lat, property.lng] as [number, number]} />
            </div>
            <p className="text-xs text-slate-400 mt-2">{property.address}, {property.city}, {property.province}</p>
          </div>
        </div>

        {/* Right: Sticky sidebar */}
        <div className="space-y-5">
          {/* Quick Stats */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sticky top-20">
            <div className="text-2xl font-black mb-1">{price ? fmt(price) : "Price on Request"}</div>
            <div className="text-slate-400 text-sm mb-4">
              {property.status === "SOLD" ? `Sold ${property.soldDate ? new Date(property.soldDate).toLocaleDateString("en-CA", { month: "short", year: "numeric" }) : ""}` : "Asking Price"}
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: "Cap Rate", value: property.capRate ? `${(property.capRate * 100).toFixed(2)}%` : "—", green: !!property.capRate && property.capRate > 0.06 },
                { label: "NOI", value: property.noi ? fmt(property.noi) : "—" },
                { label: "Building Size", value: `${property.buildingSize.toLocaleString()} sf` },
                { label: "Price/sqft", value: property.pricePerSqFt ? `$${property.pricePerSqFt.toFixed(0)}` : "—" },
                { label: "Occupancy", value: property.vacancyRate !== null && property.vacancyRate !== undefined ? `${((1 - property.vacancyRate) * 100).toFixed(0)}%` : "—" },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-400 text-sm">{s.label}</span>
                  <span className={`font-bold text-sm ${s.green ? "text-green-400" : "text-white"}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-colors mb-2">
              Contact Broker
            </button>
            <SaveButton propertyId={property.id} fullWidth />
          </div>

          {/* Investment Calculator */}
          {price && property.noi && (
            <InvestmentCalculator price={price} noi={property.noi} capRate={property.capRate} />
          )}
        </div>
      </div>
    </div>
  );
}
