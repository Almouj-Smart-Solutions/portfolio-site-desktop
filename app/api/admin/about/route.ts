import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const content = await prisma.aboutContent.findFirst({ where: { id: 1 } });
  const theories = await prisma.aboutTheory.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ bioHtml: content?.bioHtml ?? "", theories });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { bioHtml, theories } = body;

  const content = await prisma.aboutContent.upsert({
    where: { id: 1 },
    update: { bioHtml },
    create: { id: 1, bioHtml: bioHtml ?? "" },
  });

  if (Array.isArray(theories)) {
    await prisma.aboutTheory.deleteMany();
    if (theories.length > 0) {
      await prisma.aboutTheory.createMany({
        data: theories.map((theory: { label?: string; color?: string }, index: number) => ({
          label: theory.label ?? "",
          color: theory.color ?? "pink",
          position: index,
        })),
      });
    }
  }

  const savedTheories = await prisma.aboutTheory.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ ...content, theories: savedTheories });
}
