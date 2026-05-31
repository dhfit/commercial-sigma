import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property-card";
import { Filters } from "@/components/filters";
import { MapWrapper as PropertyMap } from "@/components/map-wrapper";

type Props = {
  searchParams: Promise<{
    city?: string;
    type?: string | string[];
    status?: string;
    minCap?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    view?: string;
  }>;
};

async function getProperties(sp: Awaited<Props["searchParams"]>) {
  const types = Array.isArray(sp.type) ? sp.type : sp.type ? [sp.type] : [];
  const sort = sp.sort ?? "newest";
  const page = parseInt(sp.page ?? "1");

  const where: Record<string, unknown> = {};
  if (sp.city) where.city = sp.city;
  if (types.length > 0) where.propertyType = { in: types };
  if (sp.status) where.status = sp.status;
  if (sp.minCap) where.capRate = { gte: parseFloat(sp.minCap) };
  if (sp.maxPrice) {
    const maxP = parseFloat(sp.maxPrice);
    where.OR = [{ askingPrice: { lte: maxP } }, { soldPrice: { lte: maxP } }];
  }

  let orderBy: Record<string, string> | Record<string, string>[] = { listedDate: "desc" };
  if (sort === "cap_rate_high") orderBy = { capRate: "desc" };
  else if (sort === "cap_rate_low") orderBy = { capRate: "asc" };
  else if (sort === "price_high") orderBy = [{ askingPrice: "desc" }, { soldPrice: "desc" }];
  else if (sort === "price_low") orderBy = [{ askingPrice: "asc" }, { soldPrice: "asc" }];
  else if (sort === "size_high") orderBy = { buildingSize: "desc" };

  const limit = 12;
  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, limit };
}

async function getAllForMap(sp: Awaited<Props["searchParams"]>) {
  const types = Array.isArray(sp.type) ? sp.type : sp.type ? [sp.type] : [];
  const where: Record<string, unknown> = {};
  if (sp.city) where.city = sp.city;
  if (types.length > 0) where.propertyType = { in: types };
  if (sp.status) where.status = sp.status;

  return prisma.property.findMany({
    where,
    select: { id: true, address: true, city: true, lat: true, lng: true, propertyType: true, status: true, askingPrice: true, soldPrice: true, capRate: true, buildingSize: true },
  });
}

export default async function PropertiesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [{ properties, total, page, limit }, mapProps] = await Promise.all([getProperties(sp), getAllForMap(sp)]);

  const totalPages = Math.ceil(total / limit);
  const hasFilters = Object.keys(sp).some((k) => k !== "view" && k !== "page" && sp[k as keyof typeof sp]);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {sp.city ? `${sp.city} Commercial Properties` : "Ontario Commercial Properties"}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {total.toLocaleString()} {hasFilters ? "matching" : ""} properties
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <Suspense>
          <Filters />
        </Suspense>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Map */}
          <div className="h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-6">
            <PropertyMap properties={mapProps} />
          </div>

          {/* Results */}
          {properties.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-semibold">No properties match your filters</p>
              <p className="text-sm mt-1">Try broadening your search criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][]), page: String(p) }).toString()}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
