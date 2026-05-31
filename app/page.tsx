import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";

async function getStats() {
  const [forSale, sold, avgCapRateResult] = await Promise.all([
    prisma.property.count({ where: { status: "FOR_SALE" } }),
    prisma.property.count({ where: { status: "SOLD" } }),
    prisma.property.aggregate({ _avg: { capRate: true }, where: { capRate: { not: null } } }),
  ]);
  return { forSale, sold, avgCapRate: avgCapRateResult._avg.capRate };
}

async function getFeatured() {
  return prisma.property.findMany({
    where: { status: "FOR_SALE" },
    orderBy: { listedDate: "desc" },
    take: 6,
  });
}

const TYPE_COLORS: Record<string, string> = {
  INDUSTRIAL: "bg-slate-700",
  OFFICE: "bg-blue-700",
  RETAIL: "bg-violet-700",
  MULTIFAMILY: "bg-green-700",
  MIXED_USE: "bg-amber-600",
};

const MARKET_HIGHLIGHTS = [
  { city: "Toronto", type: "Industrial", capRate: "5.9%", trend: "+8.2% YoY price", up: true },
  { city: "Mississauga", type: "Industrial", capRate: "5.8%", trend: "+6.8% YoY price", up: true },
  { city: "Hamilton", type: "Industrial", capRate: "7.2%", trend: "+9.2% YoY price", up: true },
  { city: "Ottawa", type: "Office", capRate: "7.2%", trend: "-1.8% YoY price", up: false },
  { city: "Vaughan", type: "Industrial", capRate: "5.7%", trend: "+7.8% YoY price", up: true },
  { city: "Toronto", type: "Multifamily", capRate: "4.3%", trend: "+6.2% YoY price", up: true },
];

export default async function HomePage() {
  const [stats, featured] = await Promise.all([getStats(), getFeatured()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #2563eb 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0f3460 0%, transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              {"Ontario's most transparent commercial RE data"}
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              Commercial Real Estate.<br />
              <span className="text-blue-400">No Secrets.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Search sold prices, actual cap rates, NOI, tenant rosters, and lease data for every commercial property in Ontario. The data brokers keep hidden.
            </p>

            <div className="bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-2xl">
              <input
                type="text"
                placeholder="Address, city, or neighbourhood..."
                className="flex-1 px-4 py-3 text-slate-800 rounded-lg outline-none text-sm"
                readOnly
              />
              <select className="px-4 py-3 text-slate-600 bg-slate-50 rounded-lg text-sm outline-none border-0">
                <option value="">All Types</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="OFFICE">Office</option>
                <option value="RETAIL">Retail</option>
                <option value="MULTIFAMILY">Multifamily</option>
                <option value="MIXED_USE">Mixed-Use</option>
              </select>
              <Link
                href="/properties"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors text-center whitespace-nowrap"
              >
                Search Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: "Active Listings", value: stats.forSale.toLocaleString(), sub: "properties for sale" },
              { label: "Sold This Year", value: stats.sold.toLocaleString(), sub: "transactions with price data" },
              { label: "Avg Cap Rate", value: stats.avgCapRate ? `${(stats.avgCapRate * 100).toFixed(1)}%` : "—", sub: "across all property types" },
              { label: "Markets Covered", value: "7", sub: "Ontario cities" },
            ].map((s) => (
              <div key={s.label} className="py-5 px-6 text-center">
                <div className="text-3xl font-black text-slate-900">{s.value}</div>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Recent Listings</h2>
            <p className="text-slate-500 mt-1">Newly listed commercial properties with full financial data</p>
          </div>
          <Link href="/properties" className="text-blue-600 hover:text-blue-500 font-semibold text-sm">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* Market Highlights */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-black">Market Pulse</h2>
            <p className="text-slate-400 mt-1">Live cap rate benchmarks by city and asset class — Q3 2025</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKET_HIGHLIGHTS.map((m) => (
              <div key={`${m.city}-${m.type}`} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm font-medium">{m.city}</span>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${TYPE_COLORS[m.type.toUpperCase().replace(/-/g, "_")] ?? "bg-slate-700"}`}>
                    {m.type}
                  </span>
                </div>
                <div className="text-4xl font-black text-white mb-2">{m.capRate}</div>
                <div className="text-xs font-medium">
                  <span className={m.up ? "text-green-400" : "text-red-400"}>
                    {m.up ? "▲" : "▼"} {m.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/market" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold transition-colors">
              Full Market Analytics →
            </Link>
          </div>
        </div>
      </section>

      {/* Why CommercialSigma */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-slate-900">Why CommercialSigma?</h2>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
            {"Commercial real estate has been an opaque, broker-controlled market. We're changing that."}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "💰", title: "Actual Sold Prices", desc: "See what properties actually sold for — not just asking prices. Compare sale price to assessment value and asking price to spot the true market." },
            { icon: "📊", title: "Real Cap Rates & NOI", desc: "Every listing shows Net Operating Income, capitalization rate, and gross rent multiplier calculated from actual financials — not broker estimates." },
            { icon: "🏢", title: "Full Tenant Rosters", desc: "Know who's in the building, when leases expire, and what they're paying per square foot. Critical intelligence brokers typically hide from buyers." },
            { icon: "📈", title: "Price History", desc: "Full transaction history for every property. See every price change, prior sale price, and assessment history to understand the trajectory." },
            { icon: "🔍", title: "Comparable Sales", desc: "Automated comps engine finds similar properties that actually sold. Stop relying on brokers to cherry-pick favourable comparables." },
            { icon: "🗺️", title: "Market Analytics", desc: "Aggregate cap rate trends, price/sqft data, and transaction volume by city and asset class — updated quarterly from actual deal data." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl font-black mb-4">Start with free access.</h2>
          <p className="text-blue-100 text-lg mb-8">No broker required. No paywall for basic data. Search, analyze, and save properties instantly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Create Free Account
            </Link>
            <Link href="/properties" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg border border-blue-500">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
