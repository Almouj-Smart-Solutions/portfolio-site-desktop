import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.cvEducation.findMany({ orderBy: { position: "asc" } }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const count = await prisma.cvEducation.count();
  const item = await prisma.cvEducation.create({
    data: { dateRange: body.dateRange, degree: body.degree, institution: body.institution, position: count },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  const item = await prisma.cvEducation.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await prisma.cvEducation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
