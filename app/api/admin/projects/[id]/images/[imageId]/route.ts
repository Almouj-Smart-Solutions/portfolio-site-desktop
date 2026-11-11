import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePortfolio } from "@/lib/revalidate-portfolio";
import { unlink } from "fs/promises";
import path from "path";

// DELETE single image
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const image = await prisma.projectImage.findUnique({ where: { id: parseInt(imageId) } });

  if (image) {
    // Try to delete file from disk
    try {
      const filePath = path.join(process.cwd(), "public", image.url);
      await unlink(filePath);
    } catch {
      // File may not exist on disk (e.g., seeded SVG paths), that's fine
    }
    await prisma.projectImage.delete({ where: { id: parseInt(imageId) } });
  }

  revalidatePortfolio();
  return NextResponse.json({ ok: true });
}

// PUT reorder images
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const body = await request.json();

  if (imageId === "reorder") {
    // body: { order: [{ id, order }] }
    const updates = body.order as { id: number; order: number }[];
    await Promise.all(
      updates.map((u) =>
        prisma.projectImage.update({ where: { id: u.id }, data: { order: u.order } })
      )
    );
    revalidatePortfolio();
    return NextResponse.json({ ok: true });
  }

  const image = await prisma.projectImage.update({
    where: { id: parseInt(imageId) },
    data: { order: body.order },
  });
  revalidatePortfolio();
  return NextResponse.json(image);
}
