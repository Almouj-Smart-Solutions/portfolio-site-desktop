import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: body,
    create: { id: 1, ...body },
  });
  return NextResponse.json(settings);
}
