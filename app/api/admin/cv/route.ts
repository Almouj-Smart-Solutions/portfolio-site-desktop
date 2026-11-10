import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all CV data at once
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [education, research, awards, experience] = await Promise.all([
    prisma.cvEducation.findMany({ orderBy: { position: "asc" } }),
    prisma.cvResearchInterest.findMany({ orderBy: { position: "asc" } }),
    prisma.cvAward.findMany({ orderBy: { position: "asc" } }),
    prisma.cvExperience.findMany({ orderBy: { position: "asc" } }),
  ]);

  return NextResponse.json({ education, research, awards, experience });
}
