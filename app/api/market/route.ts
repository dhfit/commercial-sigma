import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "Toronto";
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { city };
  if (type) where.propertyType = type;

  const [marketData, summary] = await Promise.all([
    prisma.marketData.findMany({
      where,
      orderBy: { period: "asc" },
    }),
    prisma.property.aggregate({
      where: { city, ...(type ? { propertyType: type } : {}) },
      _avg: { capRate: true, pricePerSqFt: true, vacancyRate: true, noi: true },
      _count: true,
    }),
  ]);

  const soldCount = await prisma.property.count({
    where: { city, status: "SOLD", ...(type ? { propertyType: type } : {}) },
  });

  const byType = await prisma.marketData.groupBy({
    by: ["propertyType"],
    where: { city, period: "2025-Q3" },
    _avg: { avgCapRate: true, avgPricePerSqFt: true, vacancyRate: true },
    orderBy: { _avg: { avgCapRate: "asc" } },
  });

  return NextResponse.json({ marketData, summary, soldCount, byType });
}
