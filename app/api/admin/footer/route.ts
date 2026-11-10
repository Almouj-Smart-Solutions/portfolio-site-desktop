import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const footer = await prisma.footerContent.findFirst({
    include: {
      links: { orderBy: { order: "asc" } },
      downloads: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(footer);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { links, downloads, ...footerData } = body;

  // Update footer core fields
  const footer = await prisma.footerContent.upsert({
    where: { id: 1 },
    update: footerData,
    create: { id: 1, ...footerData },
  });

  // Replace links if provided
  if (links !== undefined) {
    await prisma.footerLink.deleteMany({ where: { footerId: 1 } });
    if (links.length > 0) {
      await prisma.footerLink.createMany({
        data: links.map((l: { label: string; url: string }, i: number) => ({
          label: l.label,
          url: l.url,
          order: i,
          footerId: 1,
        })),
      });
    }
  }

  // Replace downloads if provided
  if (downloads !== undefined) {
    await prisma.footerDownload.deleteMany({ where: { footerId: 1 } });
    if (downloads.length > 0) {
      await prisma.footerDownload.createMany({
        data: downloads.map((d: { label: string; url: string; filename: string }, i: number) => ({
          label: d.label,
          url: d.url,
          filename: d.filename || "",
          order: i,
          footerId: 1,
        })),
      });
    }
  }

  const updated = await prisma.footerContent.findFirst({
    include: {
      links: { orderBy: { order: "asc" } },
      downloads: { orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(updated);
}
