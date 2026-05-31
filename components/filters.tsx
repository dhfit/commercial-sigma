"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CITIES = ["Toronto", "Mississauga", "Brampton", "Hamilton", "Ottawa", "Vaughan", "Markham"];
const TYPES = [
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "OFFICE", label: "Office" },
  { value: "RETAIL", label: "Retail" },
  { value: "MULTIFAMILY", label: "Multifamily" },
  { value: "MIXED_USE", label: "Mixed-Use" },
];
const STATUSES = [
  { value: "", label: "All" },
  { value: "FOR_SALE", label: "For Sale" },
  { value: "SOLD", label: "Sold" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest Listed" },
  { value: "cap_rate_high", label: "Cap Rate (High→Low)" },
  { value: "cap_rate_low", label: "Cap Rate (Low→High)" },
  { value: "price_high", label: "Price (High→Low)" },
  { value: "price_low", label: "Price (Low→High)" },
  { value: "size_high", label: "Size (Largest)" },
];

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/properties?${params.toString()}`);
  }, [router, searchParams]);

  const clearAll = useCallback(() => {
    router.push("/properties");
  }, [router]);

  const hasFilters = searchParams.toString() !== "";

  const activeTypes = searchParams.getAll("type");

  const toggleType = useCallback((type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll("type");
    if (existing.includes(type)) {
      params.delete("type");
      existing.filter(t => t !== type).forEach(t => params.append("type", t));
    } else {
      params.append("type", type);
    }
    params.delete("page");
    router.push(`/properties?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 text-base">Filters</h3>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-500 font-semibold">
              Clear all
            </button>
          )}
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => {
              const active = (searchParams.get("status") ?? "") === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => update("status", s.value)}
                  className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Types */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Property Type</label>
          <div className="space-y-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleType(t.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTypes.includes(t.value) ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${activeTypes.includes(t.value) ? "bg-blue-500" : "bg-slate-300"}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">City</label>
          <select
            value={searchParams.get("city") ?? ""}
            onChange={(e) => update("city", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-blue-400"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Min Cap Rate */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Min Cap Rate</label>
          <select
            value={searchParams.get("minCap") ?? ""}
            onChange={(e) => update("minCap", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-blue-400"
          >
            <option value="">Any</option>
            <option value="0.04">4%+</option>
            <option value="0.05">5%+</option>
            <option value="0.06">6%+</option>
            <option value="0.07">7%+</option>
            <option value="0.08">8%+</option>
          </select>
        </div>

        {/* Max Price */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Max Price</label>
          <select
            value={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-blue-400"
          >
            <option value="">Any</option>
            <option value="10000000">Under $10M</option>
            <option value="20000000">Under $20M</option>
            <option value="30000000">Under $30M</option>
            <option value="50000000">Under $50M</option>
            <option value="100000000">Under $100M</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Sort By</label>
          <select
            value={searchParams.get("sort") ?? "newest"}
            onChange={(e) => update("sort", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white outline-none focus:border-blue-400"
          >
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
    </aside>
  );
}
