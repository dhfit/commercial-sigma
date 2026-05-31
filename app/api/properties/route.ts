import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city = searchParams.get("city");
  const types = searchParams.getAll("type");
  const status = searchParams.get("status");
  const minCap = searchParams.get("minCap");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const where: Record<string, unknown> = {};
  if (city) where.city = city;
  if (types.length > 0) where.propertyType = { in: types };
  if (status) where.status = status;
  if (minCap) where.capRate = { gte: parseFloat(minCap) };
  if (maxPrice) {
    const maxP = parseFloat(maxPrice);
    where.OR = [
      { askingPrice: { lte: maxP } },
      { soldPrice: { lte: maxP } },
    ];
  }

  let orderBy: Record<string, string> | Record<string, string>[] = { listedDate: "desc" };
  if (sort === "cap_rate_high") orderBy = { capRate: "desc" };
  else if (sort === "cap_rate_low") orderBy = { capRate: "asc" };
  else if (sort === "price_high") orderBy = [{ askingPrice: "desc" }, { soldPrice: "desc" }];
  else if (sort === "price_low") orderBy = [{ askingPrice: "asc" }, { soldPrice: "asc" }];
  else if (sort === "size_high") orderBy = { buildingSize: "desc" };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ properties, total, page, limit });
}
