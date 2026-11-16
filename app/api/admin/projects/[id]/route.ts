import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePortfolio } from "@/lib/revalidate-portfolio";
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
      layoutJson: typeof body.layoutJson === "string" ? body.layoutJson : undefined,
      published: body.published,
      order: body.order,
      slug: body.slug,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });

  revalidatePortfolio();
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
  revalidatePortfolio();
  return NextResponse.json({ ok: true });
}

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB per file

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Handle image upload
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (!Number.isFinite(projectId)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Could not read upload body";
    return NextResponse.json(
      { error: `Upload body rejected (often too large for proxy/Cloudflare): ${message}` },
      { status: 413 },
    );
  }

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => typeof File !== "undefined" && entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return NextResponse.json({ error: "No image files received" }, { status: 400 });
  }

  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB). Max is 12MB.` },
        { status: 413 },
      );
    }
    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: `"${file.name}" is not an image file.` }, { status: 400 });
    }
  }

  const safeSlug = project.slug.replace(/[^a-z0-9-]/gi, "") || `project-${project.id}`;
  const uploadDir = path.join(process.cwd(), "public", "assets", "work", safeSlug);

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "mkdir failed";
    return NextResponse.json(
      { error: `Cannot create upload folder (permission/volume issue): ${message}` },
      { status: 500 },
    );
  }

  const currentCount = await prisma.projectImage.count({ where: { projectId } });
  const createdImages = [];

  try {
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
          projectId,
          order: currentCount + i,
        },
      });
      createdImages.push(image);
    }
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "write failed";
    return NextResponse.json(
      {
        error: `Could not save image to disk: ${message}. On VPS check volume permissions for /app/public/assets/work.`,
      },
      { status: 500 },
    );
  }

  revalidatePortfolio();
  return NextResponse.json(createdImages, { status: 201 });
}
