import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const count = await prisma.project.count();

  // Generate slug from title
  const slug = (body.slug || body.title || "new-project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const project = await prisma.project.create({
    data: {
      slug: `${slug}-${Date.now()}`,
      title: body.title || "New Project",
      subtitle: body.subtitle || "",
      year: body.year || new Date().getFullYear(),
      projectType: body.projectType || "",
      role: body.role || "",
      size: body.size || "",
      location: body.location || "",
      status: body.status || "",
      client: body.client || "",
      summary: body.summary || "",
      essay: body.essay || "",
      tags: body.tags ? JSON.stringify(body.tags) : "[]",
      published: body.published ?? true,
      order: count,
    },
    include: { images: true },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updates = body.order as { id: number; order: number }[] | undefined;
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Expected order array" }, { status: 400 });
  }

  await prisma.$transaction(
    updates.map((item) =>
      prisma.project.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
