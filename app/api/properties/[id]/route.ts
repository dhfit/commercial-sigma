import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      tenants: true,
      priceHistory: { orderBy: { date: "asc" } },
    },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get comps: same type, same city, ±30% size, sold within 18 months
  const comps = await prisma.property.findMany({
    where: {
      id: { not: id },
      city: property.city,
      propertyType: property.propertyType,
      status: "SOLD",
      soldDate: { gte: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000) },
      buildingSize: {
        gte: property.buildingSize * 0.7,
        lte: property.buildingSize * 1.3,
      },
    },
    take: 4,
    orderBy: { soldDate: "desc" },
  });

  return NextResponse.json({ property, comps });
}
