-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Payman Tahghighi',
    "tagline" TEXT NOT NULL DEFAULT 'Architect · Researcher · Artist',
    "accentPink" TEXT NOT NULL DEFAULT '#F43454',
    "accentOrange" TEXT NOT NULL DEFAULT '#FB7A04',
    "accentGreen" TEXT NOT NULL DEFAULT '#83E01B'
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "bioHtml" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "AboutTheory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CvEducation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateRange" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CvResearchInterest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CvAward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CvExperience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateRange" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL DEFAULT 2024,
    "projectType" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "size" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "client" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "essay" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FooterContent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "authorName" TEXT NOT NULL DEFAULT 'SEYED JAVAD (aka PAYMAN) TAHGHIGHI JAHROMI',
    "email" TEXT NOT NULL DEFAULT 'paymantahghighi@gmail.com',
    "copyright" TEXT NOT NULL DEFAULT '© 2026 copyright by Seyed Javad Tahghighi Jahromi. all rights reserved.',
    "disciplineLeft" TEXT NOT NULL DEFAULT 'architecture x philosophy',
    "disciplineCenter" TEXT NOT NULL DEFAULT 'architecture x urbanism',
    "disciplineRight" TEXT NOT NULL DEFAULT 'architecture x technology'
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "footerId" INTEGER NOT NULL,
    CONSTRAINT "FooterLink_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "FooterContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FooterDownload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "footerId" INTEGER NOT NULL,
    CONSTRAINT "FooterDownload_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "FooterContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
