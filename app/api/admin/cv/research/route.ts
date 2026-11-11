import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePortfolio } from "@/lib/revalidate-portfolio";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.cvResearchInterest.findMany({ orderBy: { position: "asc" } }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const count = await prisma.cvResearchInterest.count();
  const item = await prisma.cvResearchInterest.create({
    data: { title: body.title, description: body.description, position: count },
  });
  revalidatePortfolio();
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  const item = await prisma.cvResearchInterest.update({ where: { id }, data });
  revalidatePortfolio();
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json();
  await prisma.cvResearchInterest.delete({ where: { id } });
  revalidatePortfolio();
  return NextResponse.json({ ok: true });
}
