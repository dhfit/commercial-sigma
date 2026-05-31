import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedProperty.findMany({
    where: { userId: session.user.id },
    include: { property: true },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json(saved);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { propertyId } = await req.json();
  if (!propertyId) return NextResponse.json({ error: "propertyId required" }, { status: 400 });

  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId: session.user.id, propertyId } },
  });

  if (existing) {
    await prisma.savedProperty.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.savedProperty.create({ data: { userId: session.user.id, propertyId } });
  return NextResponse.json({ saved: true });
}
