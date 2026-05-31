import Link from "next/link";

type Property = {
  id: string;
  address: string;
  city: string;
  neighborhood?: string | null;
  propertyType: string;
  propertySubtype?: string | null;
  buildingSize: number;
  status: string;
  askingPrice?: number | null;
  soldPrice?: number | null;
  soldDate?: Date | null;
  daysOnMarket?: number | null;
  noi?: number | null;
  capRate?: number | null;
  pricePerSqFt?: number | null;
  vacancyRate?: number | null;
  numUnits?: number | null;
  yearBuilt?: number | null;
};

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  INDUSTRIAL: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
  OFFICE: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  RETAIL: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  MULTIFAMILY: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  MIXED_USE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  LAND: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export function PropertyCard({ property: p }: { property: Property }) {
  const style = TYPE_STYLES[p.propertyType] ?? TYPE_STYLES.INDUSTRIAL;
  const price = p.status === "SOLD" ? p.soldPrice : p.askingPrice;
  const isSold = p.status === "SOLD";

  return (
    <Link href={`/properties/${p.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 overflow-hidden">
        {/* Color bar */}
        <div className={`h-1.5 ${style.dot}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${style.bg} ${style.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {p.propertySubtype ?? p.propertyType.replace("_", " ")}
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-700 transition-colors">
                {p.address}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {p.neighborhood ? `${p.neighborhood}, ` : ""}{p.city}
              </p>
            </div>
            {isSold ? (
              <span className="shrink-0 text-xs font-bold bg-slate-800 text-white px-2.5 py-1 rounded-full">SOLD</span>
            ) : (
              <span className="shrink-0 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">FOR SALE</span>
            )}
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="text-2xl font-black text-slate-900">
              {price ? fmt(price) : "Price on Request"}
            </div>
            {p.pricePerSqFt && (
              <div className="text-xs text-slate-400 mt-0.5">
                ${p.pricePerSqFt.toFixed(0)}/sqft
              </div>
            )}
            {isSold && p.soldDate && (
              <div className="text-xs text-slate-400 mt-0.5">
                Sold {new Date(p.soldDate).toLocaleDateString("en-CA", { month: "short", year: "numeric" })}
              </div>
            )}
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-xs text-slate-400 font-medium">Cap Rate</div>
              <div className={`text-sm font-black mt-0.5 ${p.capRate && p.capRate > 0.06 ? "text-green-600" : "text-slate-800"}`}>
                {p.capRate ? `${(p.capRate * 100).toFixed(1)}%` : "—"}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-xs text-slate-400 font-medium">NOI</div>
              <div className="text-sm font-black text-slate-800 mt-0.5">
                {p.noi ? fmt(p.noi) : "—"}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <div className="text-xs text-slate-400 font-medium">Size</div>
              <div className="text-sm font-black text-slate-800 mt-0.5">
                {p.buildingSize >= 1000 ? `${(p.buildingSize / 1000).toFixed(0)}K` : p.buildingSize.toLocaleString()} sf
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
            <span>{p.yearBuilt ? `Built ${p.yearBuilt}` : ""}{p.numUnits ? ` • ${p.numUnits} units` : ""}</span>
            <span>
              {!isSold && p.daysOnMarket ? `${p.daysOnMarket} days on market` : ""}
              {isSold && <span className="text-green-600 font-semibold">✓ Sold — price shown</span>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
