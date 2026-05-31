import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import Link from "next/link";

export default async function SavedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const saved = await prisma.savedProperty.findMany({
    where: { userId: session.user.id },
    include: { property: true },
    orderBy: { savedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Saved Properties</h1>
        <p className="text-slate-500 mt-1">{saved.length} {saved.length === 1 ? "property" : "properties"} saved</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
          <div className="text-6xl mb-4">☆</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No saved properties yet</h2>
          <p className="text-slate-500 text-sm mb-6">Save properties from listings to track them here</p>
          <Link href="/properties" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map(({ property, savedAt }) => (
            <div key={property.id} className="relative">
              <div className="absolute top-4 right-4 z-10 text-xs text-slate-400 bg-white/90 px-2 py-1 rounded-full">
                Saved {new Date(savedAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
              </div>
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
