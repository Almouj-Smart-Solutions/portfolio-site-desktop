import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const maxBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  const extension = extensions[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Use a JPG, PNG, GIF, WebP, or SVG image." }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "assets", "work", "about");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/assets/work/about/${filename}` }, { status: 201 });
}
