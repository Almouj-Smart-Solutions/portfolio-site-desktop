import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id: parseInt(id) },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const project = await prisma.project.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      subtitle: body.subtitle,
      year: body.year,
      projectType: body.projectType,
      architect: body.architect,
      firm: body.firm,
      role: body.role,
      projectFunction: body.projectFunction,
      awardFeature: body.awardFeature,
      size: body.size,
      location: body.location,
      status: body.status,
      client: body.client,
      teamLabel: body.teamLabel,
      team: body.team,
      specificRoles: body.specificRoles,
      timeline: body.timeline,
      summary: body.summary,
      essay: body.essay,
      tags: body.tags ? JSON.stringify(body.tags) : undefined,
      published: body.published,
      order: body.order,
      slug: body.slug,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Handle image upload
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("images") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const safeSlug = project.slug.replace(/[^a-z0-9-]/gi, "");
  const uploadDir = path.join(process.cwd(), "public", "assets", "work", safeSlug);
  await mkdir(uploadDir, { recursive: true });

  const currentCount = await prisma.projectImage.count({ where: { projectId: parseInt(id) } });
  const createdImages = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());
    const rawExt = file.name.split(".").pop() || "jpg";
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filename = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const image = await prisma.projectImage.create({
      data: {
        url: `/assets/work/${safeSlug}/${filename}`,
        projectId: parseInt(id),
        order: currentCount + i,
      },
    });
    createdImages.push(image);
  }

  return NextResponse.json(createdImages, { status: 201 });
}
