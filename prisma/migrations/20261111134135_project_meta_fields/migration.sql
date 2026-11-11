-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL DEFAULT 2024,
    "projectType" TEXT NOT NULL DEFAULT '',
    "architect" TEXT NOT NULL DEFAULT '',
    "firm" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "projectFunction" TEXT NOT NULL DEFAULT '',
    "awardFeature" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "client" TEXT NOT NULL DEFAULT '',
    "team" TEXT NOT NULL DEFAULT '',
    "specificRoles" TEXT NOT NULL DEFAULT '',
    "timeline" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "essay" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("client", "createdAt", "essay", "id", "location", "order", "projectType", "published", "role", "size", "slug", "status", "subtitle", "summary", "tags", "title", "updatedAt", "year") SELECT "client", "createdAt", "essay", "id", "location", "order", "projectType", "published", "role", "size", "slug", "status", "subtitle", "summary", "tags", "title", "updatedAt", "year" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
