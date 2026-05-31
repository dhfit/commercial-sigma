"use client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";

type MarketDataRow = {
  period: string;
  propertyType: string;
  avgCapRate?: number | null;
  avgPricePerSqFt?: number | null;
  totalVolume?: number | null;
  numTransactions?: number | null;
  vacancyRate?: number | null;
};

const TYPE_COLORS: Record<string, string> = {
  INDUSTRIAL: "#334155",
  OFFICE: "#2563eb",
  RETAIL: "#7c3aed",
  MULTIFAMILY: "#16a34a",
  MIXED_USE: "#d97706",
};

const TYPE_LABELS: Record<string, string> = {
  INDUSTRIAL: "Industrial", OFFICE: "Office", RETAIL: "Retail", MULTIFAMILY: "Multifamily", MIXED_USE: "Mixed-Use",
};

function fmtVol(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${(n / 1_000_000).toFixed(0)}M`;
}

export function MarketCharts({ marketData, byType, city }: { marketData: MarketDataRow[]; byType: MarketDataRow[]; city: string }) {
  // Build cap rate over time by type
  const periods = [...new Set(marketData.map((d) => d.period))].sort();
  const types = [...new Set(marketData.map((d) => d.propertyType))];

  const capRateData = periods.map((period) => {
    const row: Record<string, string | number> = { period };
    types.forEach((t) => {
      const match = marketData.find((d) => d.period === period && d.propertyType === t);
      if (match?.avgCapRate) row[t] = parseFloat((match.avgCapRate * 100).toFixed(2));
    });
    return row;
  });

  const volumeData = periods.map((period) => {
    const row: Record<string, string | number> = { period };
    types.forEach((t) => {
      const match = marketData.find((d) => d.period === period && d.propertyType === t);
      if (match?.totalVolume) row[t] = match.totalVolume / 1_000_000;
    });
    return row;
  });

  const pricePerSqFtData = byType.map((d) => ({
    type: TYPE_LABELS[d.propertyType] ?? d.propertyType,
    price: d.avgPricePerSqFt ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cap Rate Over Time */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">{city} Cap Rate Trend</h3>
        <p className="text-xs text-slate-400 mb-4">By asset class, quarterly</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={capRateData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}%`, ""]} contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#f8fafc" }} />
              <Legend formatter={(v) => TYPE_LABELS[v] ?? v} wrapperStyle={{ fontSize: 11 }} />
              {types.map((t) => (
                <Line key={t} type="monotone" dataKey={t} stroke={TYPE_COLORS[t] ?? "#888"} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Volume */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">{city} Transaction Volume</h3>
        <p className="text-xs text-slate-400 mb-4">$ millions per quarter</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => `$${v}M`} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`$${Number(v).toFixed(0)}M`, ""]} contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#f8fafc" }} />
              <Legend formatter={(v) => TYPE_LABELS[v] ?? v} wrapperStyle={{ fontSize: 11 }} />
              {types.map((t) => (
                <Bar key={t} dataKey={t} stackId="vol" fill={TYPE_COLORS[t] ?? "#888"} radius={t === types[types.length - 1] ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Per SqFt by Type */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">{city} Price/SqFt by Asset Class</h3>
        <p className="text-xs text-slate-400 mb-4">Q3 2025</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pricePerSqFtData} layout="vertical" margin={{ top: 4, right: 8, left: 40, bottom: 0 }}>
              <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [`$${v}/sf`, "Avg Price"]} contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 11, color: "#f8fafc" }} />
              <Bar dataKey="price" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vacancy Rate Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">{city} Vacancy Rate</h3>
        <p className="text-xs text-slate-400 mb-4">By asset class, Q3 2025</p>
        <div className="space-y-3 mt-4">
          {byType.filter((d) => d.vacancyRate).map((d) => (
            <div key={d.propertyType}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="font-medium">{TYPE_LABELS[d.propertyType] ?? d.propertyType}</span>
                <span className={`font-bold ${(d.vacancyRate ?? 0) > 0.1 ? "text-red-600" : (d.vacancyRate ?? 0) > 0.05 ? "text-amber-600" : "text-green-600"}`}>
                  {((d.vacancyRate ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${(d.vacancyRate ?? 0) > 0.1 ? "bg-red-500" : (d.vacancyRate ?? 0) > 0.05 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min((d.vacancyRate ?? 0) * 500, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
