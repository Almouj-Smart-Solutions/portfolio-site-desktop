import { PrismaClient } from "@prisma/client";
import { workProjects } from "../lib/data.ts";

const prisma = new PrismaClient();

async function syncProject(project, order) {
  const existing = await prisma.project.findUnique({ where: { slug: project.slug } });
  const data = {
    title: project.title,
    subtitle: project.subtitle ?? "",
    year: project.year,
    projectType: project.projectType ?? "",
    role: project.position ?? "",
    size: project.size ?? "",
    location: project.location ?? "",
    status: project.status ?? "",
    client: project.client ?? "",
    summary: project.summary ?? "",
    essay: project.essay ?? "",
    tags: JSON.stringify(project.tags ?? []),
    published: true,
    order,
  };

  const record = existing
    ? await prisma.project.update({ where: { id: existing.id }, data })
    : await prisma.project.create({ data: { slug: project.slug, ...data } });

  await prisma.projectImage.deleteMany({ where: { projectId: record.id } });
  if (project.images?.length) {
    await prisma.projectImage.createMany({
      data: project.images.map((url, index) => ({
        url,
        projectId: record.id,
        order: index,
      })),
    });
  }

  console.log(`  ✓ ${record.slug} (${project.images?.length ?? 0} images)`);
}

async function main() {
  console.log("Syncing work projects...");
  for (const [index, project] of workProjects.entries()) {
    await syncProject(project, index);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
