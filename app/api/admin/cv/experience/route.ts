import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.cvExperience.findMany({ orderBy: { position: "asc" } }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const count = await prisma.cvExperience.count();
  const item = await prisma.cvExperience.create({
    data: { dateRange: body.dateRange, organization: body.organization, location: body.location, position: count },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  const item = await prisma.cvExperience.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await prisma.cvExperience.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
