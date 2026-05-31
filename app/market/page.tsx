import { prisma } from "@/lib/prisma";
import { MarketCharts } from "@/components/market-charts";
import Link from "next/link";

const CITIES = ["Toronto", "Mississauga", "Brampton", "Hamilton", "Ottawa", "Vaughan", "Markham"];
const TYPE_LABELS: Record<string, string> = {
  INDUSTRIAL: "Industrial", OFFICE: "Office", RETAIL: "Retail", MULTIFAMILY: "Multifamily", MIXED_USE: "Mixed-Use",
};

type Props = { searchParams: Promise<{ city?: string; type?: string }> };

async function getMarketData(city: string, type?: string) {
  const where: Record<string, unknown> = { city };
  if (type) where.propertyType = type;

  const [marketData, byType, transactions] = await Promise.all([
    prisma.marketData.findMany({ where, orderBy: { period: "asc" } }),
    prisma.marketData.findMany({
      where: { city, period: "2025-Q3" },
      orderBy: { avgCapRate: "asc" },
    }),
    prisma.property.findMany({
      where: { city, status: "SOLD", soldDate: { gte: new Date("2025-01-01") } },
      orderBy: { soldDate: "desc" },
      take: 10,
      select: { id: true, address: true, propertyType: true, soldPrice: true, soldDate: true, capRate: true, buildingSize: true, pricePerSqFt: true },
    }),
  ]);

  return { marketData, byType, transactions };
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default async function MarketPage({ searchParams }: Props) {
  const sp = await searchParams;
  const city = sp.city ?? "Toronto";
  const type = sp.type;

  const { marketData, byType, transactions } = await getMarketData(city, type);
  const latestQ3 = byType.filter((d) => !type || d.propertyType === type);
  const totalVolume = latestQ3.reduce((s, d) => s + (d.totalVolume ?? 0), 0);
  const totalTx = latestQ3.reduce((s, d) => s + (d.numTransactions ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-1">Market Analytics</h1>
        <p className="text-slate-500">Quarterly cap rates, transaction volumes, and pricing trends across Ontario commercial markets</p>
      </div>

      {/* City + Type Selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex gap-2 flex-wrap">
          {CITIES.map((c) => (
            <Link
              key={c}
              href={`/market?city=${c}${type ? `&type=${type}` : ""}`}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${c === city ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/market?city=${city}`} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${!type ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>All Types</Link>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <Link key={k} href={`/market?city=${city}&type=${k}`} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${type === k ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{v}</Link>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Q3 2025 Transaction Volume", value: fmt(totalVolume), sub: "Total $ transacted" },
          { label: "Q3 2025 Transactions", value: totalTx.toString(), sub: "Closed deals" },
          { label: "Avg Cap Rate (Q3 2025)", value: latestQ3[0]?.avgCapRate ? `${(latestQ3.reduce((s, d) => s + (d.avgCapRate ?? 0), 0) / Math.max(latestQ3.length, 1) * 100).toFixed(1)}%` : "—", sub: city },
          { label: "Avg Price/SqFt", value: latestQ3[0]?.avgPricePerSqFt ? `$${Math.round(latestQ3.reduce((s, d) => s + (d.avgPricePerSqFt ?? 0), 0) / Math.max(latestQ3.length, 1))}` : "—", sub: "Building area" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">{s.label}</div>
            <div className="text-xs text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <MarketCharts marketData={marketData} byType={byType} city={city} />

      {/* By Asset Class Table */}
      {latestQ3.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">{city} — Q3 2025 Snapshot by Asset Class</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Asset Class", "Avg Cap Rate", "Avg Price/SqFt", "Vacancy Rate", "Transactions", "Volume", "YoY Price"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {latestQ3.map((d) => (
                  <tr key={d.propertyType} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{TYPE_LABELS[d.propertyType] ?? d.propertyType}</td>
                    <td className="py-3 pr-4 font-bold text-blue-700">{d.avgCapRate ? `${(d.avgCapRate * 100).toFixed(1)}%` : "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{d.avgPricePerSqFt ? `$${d.avgPricePerSqFt.toFixed(0)}` : "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{d.vacancyRate ? `${(d.vacancyRate * 100).toFixed(1)}%` : "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{d.numTransactions ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{d.totalVolume ? fmt(d.totalVolume) : "—"}</td>
                    <td className={`py-3 pr-4 font-semibold ${(d.yoyPriceChange ?? 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                      {d.yoyPriceChange ? `${d.yoyPriceChange > 0 ? "+" : ""}${(d.yoyPriceChange * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent {city} Transactions (2025)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Property", "Type", "Sold Price", "Cap Rate", "Size", "$/SqFt", "Date"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/properties/${t.id}`} className="text-blue-700 font-semibold hover:underline text-xs">{t.address}</Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{TYPE_LABELS[t.propertyType] ?? t.propertyType}</td>
                    <td className="py-3 pr-4 font-bold text-slate-900">{t.soldPrice ? fmt(t.soldPrice) : "—"}</td>
                    <td className="py-3 pr-4 font-semibold text-blue-700">{t.capRate ? `${(t.capRate * 100).toFixed(1)}%` : "—"}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{t.buildingSize.toLocaleString()} sf</td>
                    <td className="py-3 pr-4 text-slate-500">{t.pricePerSqFt ? `$${t.pricePerSqFt.toFixed(0)}` : "—"}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{t.soldDate ? new Date(t.soldDate).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
