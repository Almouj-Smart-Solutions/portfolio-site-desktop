# Admin Panel for Payman Tahghighi Portfolio

## Goal Description

Build a full admin panel at `/admin` that allows managing all content on the portfolio site without touching code. The admin area will be protected by NextAuth.js, persist data in SQLite via Prisma, and expose editors for every editable section:

- **About Me** — rich text bio with HTML toggle (colors, fonts, spans, etc.)
- **CV** — CRUD for Education, Research Interests, Awards/Honors, Professional Experience entries
- **Work/Projects** — full Project model with all fields + image management (upload, reorder, delete)
- **Footer** — name, email, social links, CV download links

The site's frontend components (`AboutWindow`, `CvWindow`, `WorkWindow`, `DesktopFooter`) will be refactored to read from the database via server-side data fetching instead of the hardcoded `lib/data.ts` file.

---

## User Review Required

> [!IMPORTANT]
> **File upload for project images** — uploaded images will be saved to `public/assets/work/<project-slug>/` on disk. This means the server must have write access to that directory. In Docker/production, this folder should be a mounted volume to persist across deployments.

> [!IMPORTANT]
> **NextAuth secret** — you'll need to add two env vars to your `.env.local`:
> ```
> NEXTAUTH_SECRET=<random-long-string>
> ADMIN_USERNAME=admin
> ADMIN_PASSWORD=<your-password>
> ```

> [!WARNING]
> **Breaking change to data fetching** — `CvWindow`, `AboutWindow`, `WorkWindow`, and `DesktopFooter` currently import directly from `lib/data.ts`. After this change, data will come from the database. The hardcoded content from `data.ts` will be seeded into SQLite on first run so nothing is lost.

> [!NOTE]
> **Tech stack is intentionally lean**: NextAuth (already compatible with Next.js 15), Prisma + SQLite (zero external DB), TipTap for the rich text editor, and shadcn/ui-free plain CSS for the admin UI to keep bundle size small. No new heavy frameworks.

---

## Open Questions

> [!IMPORTANT]
> **Image hosting**: Currently images are SVG files in `public/assets/work/`. For new project uploads, should images be stored locally on disk (simplest) or would you prefer to configure an external storage like S3/Cloudflare R2 later? **Plan defaults to local disk storage** which works for Docker with a volume mount.

---

## Proposed Changes

### Phase 0 — Dependencies

Install required packages:

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-image
npm install --save-dev @types/bcryptjs
npm install bcryptjs
```

---

### Phase 1 — Database Schema (Prisma + SQLite)

#### [NEW] `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./portfolio.db"
}

// ── Site-wide settings ──────────────────────────────
model SiteSettings {
  id           Int    @id @default(1)
  name         String @default("Payman Tahghighi")
  tagline      String @default("Architect · Researcher · Artist")
  accentPink   String @default("#F43454")
  accentOrange String @default("#FB7A04")
  accentGreen  String @default("#83E01B")
}

// ── About section ───────────────────────────────────
model AboutContent {
  id      Int    @id @default(1)
  bioHtml String // Stores the rich HTML bio
}

model AboutTheory {
  id       Int    @id @default(autoincrement())
  label    String
  color    String // "pink" | "orange" | "green"
  position Int    @default(0)
}

// ── CV section ──────────────────────────────────────
model CvEducation {
  id          Int    @id @default(autoincrement())
  dateRange   String // e.g. "2018-2021"
  degree      String
  institution String
  position    Int    @default(0)
}

model CvResearchInterest {
  id          Int    @id @default(autoincrement())
  title       String
  description String
  position    Int    @default(0)
}

model CvAward {
  id          Int    @id @default(autoincrement())
  year        String
  title       String
  description String
  position    Int    @default(0)
}

model CvExperience {
  id          Int    @id @default(autoincrement())
  dateRange   String
  organization String
  location    String
  position    Int    @default(0)
}

// ── Work/Projects section ───────────────────────────
model Project {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  title       String
  subtitle    String?
  year        Int
  projectType String?
  position    String?  // role / job title
  size        String?
  location    String?
  status      String?
  client      String?
  summary     String?
  essay       String?
  tags        String?  // JSON array stored as string: ["Tag1","Tag2"]
  images      Image[]
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  order       Int      @default(0)
}

model Image {
  id        Int     @id @default(autoincrement())
  url       String  // e.g. "/assets/work/slug/01.svg"
  projectId Int
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  order     Int     @default(0)
}

// ── Footer section ──────────────────────────────────
model FooterContent {
  id             Int    @id @default(1)
  authorName     String @default("SEYED JAVAD (aka PAYMAN) TAHGHIGHI JAHROMI")
  email          String @default("paymantahghighi@gmail.com")
  copyright      String @default("© 2026 copyright by Seyed Javad Tahghighi Jahromi. all rights reserved.")
  disciplineLeft   String @default("architecture x philosophy")
  disciplineCenter String @default("architecture x urbanism")
  disciplineRight  String @default("architecture x technology")
  links          FooterLink[]
  downloads      FooterDownload[]
}

model FooterLink {
  id        Int          @id @default(autoincrement())
  label     String       // e.g. "instagram"
  url       String
  order     Int          @default(0)
  footerId  Int
  footer    FooterContent @relation(fields: [footerId], references: [id], onDelete: Cascade)
}

model FooterDownload {
  id           Int          @id @default(autoincrement())
  label        String       // e.g. "abridged cv (1-page)"
  url          String       // e.g. "/assets/cv/cv.pdf"
  filename     String?      // download filename
  order        Int          @default(0)
  footerId     Int
  footer       FooterContent @relation(fields: [footerId], references: [id], onDelete: Cascade)
}
```

#### [NEW] `prisma/seed.ts`

Seeds all existing content from `lib/data.ts` into the DB on first run so nothing is lost.

#### [NEW] `lib/db.ts`

Singleton Prisma client (standard Next.js pattern):

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### Phase 2 — Authentication

#### [NEW] `app/api/auth/[...nextauth]/route.ts`

```ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { username: {}, password: {} },
      async authorize(credentials) {
        if (
          credentials.username === process.env.ADMIN_USERNAME &&
          await bcrypt.compare(credentials.password, process.env.ADMIN_PASSWORD_HASH)
        ) {
          return { id: "1", name: "Admin" };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth }) { return !!auth?.user; },
  },
});

export const { GET, POST } = handlers;
```

#### [NEW] `middleware.ts` (root of project)

Protects all `/admin` routes except `/admin/login`:

```ts
export { auth as middleware } from "@/app/api/auth/[...nextauth]/route";
export const config = { matcher: ["/admin/:path*"] };
```

---

### Phase 3 — API Routes (Next.js Route Handlers)

All under `app/api/admin/`:

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/about` | GET, PUT | Get/update bio HTML |
| `/api/admin/about/theories` | GET, POST, PUT, DELETE | Manage theory tags |
| `/api/admin/cv/education` | GET, POST, PUT, DELETE | Education entries |
| `/api/admin/cv/awards` | GET, POST, PUT, DELETE | Award entries |
| `/api/admin/cv/experience` | GET, POST, PUT, DELETE | Experience entries |
| `/api/admin/cv/research` | GET, POST, PUT, DELETE | Research interests |
| `/api/admin/projects` | GET, POST | List/create projects |
| `/api/admin/projects/[id]` | GET, PUT, DELETE | Get/update/delete project |
| `/api/admin/projects/[id]/images` | POST | Upload images |
| `/api/admin/projects/[id]/images/[imageId]` | DELETE | Remove image |
| `/api/admin/projects/[id]/images/reorder` | PUT | Reorder images |
| `/api/admin/footer` | GET, PUT | Get/update footer content |
| `/api/admin/footer/links` | GET, POST, PUT, DELETE | Social links |
| `/api/admin/footer/downloads` | GET, POST, PUT, DELETE | Download links |
| `/api/admin/site` | GET, PUT | Site settings (name, tagline, colors) |

Each route will check `auth()` to ensure the session is valid before processing.

---

### Phase 4 — Admin UI Pages

All pages under `app/admin/`:

```
app/admin/
├── layout.tsx              ← Admin shell (sidebar nav + session check)
├── login/
│   └── page.tsx            ← Login form
├── page.tsx                ← Dashboard (overview links)
├── about/
│   └── page.tsx            ← About bio editor (TipTap + HTML toggle)
├── cv/
│   └── page.tsx            ← CV editor (tabs: Education, Awards, Experience, Research)
├── projects/
│   ├── page.tsx            ← Projects list (table with edit/delete/reorder)
│   └── [id]/
│       └── page.tsx        ← Project edit form with image uploader
├── footer/
│   └── page.tsx            ← Footer editor
└── site/
    └── page.tsx            ← Site settings (name, tagline, accent colors)
```

#### Admin Layout (sidebar)

```
┌─────────────────────────────────────────────────────┐
│  ⬡ ADMIN PANEL          [Portfolio] [Sign Out]      │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  📝 About    │  [Content Area]                      │
│  📄 CV       │                                      │
│  🗂 Projects │                                      │
│  🔗 Footer   │                                      │
│  ⚙️ Site     │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

#### Admin styling

A clean, professional dark-mode admin UI using vanilla CSS. No Tailwind, no shadcn. Dark background (`#0f0f0f`), subtle borders, system fonts for the admin, accent colors from the portfolio's own palette.

#### [NEW] `app/admin/about/page.tsx` — Key Features

- TipTap editor toolbar: **Bold**, *Italic*, Underline, Strikethrough, Color picker, Font size, Font family selector, Link, Image embed, Clear formatting
- Toggle button to switch to raw HTML view (CodeMirror or plain `<textarea>`)
- Live preview pane alongside
- Save button → `PUT /api/admin/about`

#### [NEW] `app/admin/projects/page.tsx` — Key Features

- Table of all projects with: title, year, status (published/draft), image count, actions (edit, delete)
- Drag-to-reorder rows (using `dragstart`/`drop` HTML5 drag API — no library needed)
- "New Project" button → creates a blank project and navigates to edit page

#### [NEW] `app/admin/projects/[id]/page.tsx` — Key Features

- All project fields as form inputs (title, subtitle, year, type, position, size, location, status, client)
- Tags: add/remove chip UI
- Summary & Essay: plain `<textarea>` 
- Image management: drag-to-upload or browse, preview grid, drag-to-reorder, delete per image
- "Published" toggle (draft vs live)

---

### Phase 5 — Frontend Refactoring

Convert components from static imports to server-side DB reads.

#### [MODIFY] `components/desktop/AboutWindow.tsx`

Change from a pure client component with hardcoded JSX to a **server component** that fetches bio HTML from DB and renders it via `dangerouslySetInnerHTML`. The rich text HTML from TipTap is sanitized via `dompurify` (server-side safe version).

```tsx
// Server component
import { prisma } from "@/lib/db";
import DOMPurify from "isomorphic-dompurify";

export default async function AboutWindow() {
  const content = await prisma.aboutContent.findFirst();
  const safeHtml = DOMPurify.sanitize(content?.bioHtml ?? "");
  return (
    <div className={styles.aboutContainer}
         dangerouslySetInnerHTML={{ __html: safeHtml }} />
  );
}
```

The existing CSS classes (`theoryPink`, `theoryOrange`, `theoryGreen`, `italicTerm`, etc.) will still work because TipTap's HTML output can use inline styles, and the admin instructions will tell the user to use those span classes or just use inline color styles.

#### [MODIFY] `components/desktop/WorkWindow.tsx`

Becomes a server component at the `WorkWindow` level — passes `workProjects` as a prop to a client child that handles the carousel/zoom logic.

```tsx
// app/work/page.tsx → passes projects down
// WorkWindow.server.tsx → fetches from DB, renders WorkWindowClient
// WorkWindowClient.tsx  → existing client logic, receives projects as prop
```

#### [MODIFY] `components/desktop/CvWindow.tsx`

Server component — fetches all CV entries from DB, renders the same layout but with dynamic data.

#### [MODIFY] `components/desktop/DesktopFooter.tsx`

Remains a client component (due to complex animation logic), but accepts a `footerData` prop that is fetched server-side and passed down.

---

### Phase 6 — File Structure After Changes

```
d:\Peyman\portfolio-site\
├── prisma/
│   ├── schema.prisma            [NEW]
│   ├── portfolio.db             [NEW - generated]
│   └── seed.ts                  [NEW]
├── lib/
│   ├── data.ts                  [KEEP - used by seed only]
│   └── db.ts                    [NEW - Prisma singleton]
├── middleware.ts                [NEW - auth guard]
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     [NEW]
│   │   └── admin/
│   │       ├── about/route.ts   [NEW]
│   │       ├── cv/
│   │       │   ├── education/route.ts
│   │       │   ├── awards/route.ts
│   │       │   ├── experience/route.ts
│   │       │   └── research/route.ts
│   │       ├── projects/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── images/route.ts
│   │       ├── footer/route.ts
│   │       └── site/route.ts
│   └── admin/
│       ├── layout.tsx           [NEW]
│       ├── login/page.tsx       [NEW]
│       ├── page.tsx             [NEW - dashboard]
│       ├── about/page.tsx       [NEW]
│       ├── cv/page.tsx          [NEW]
│       ├── projects/
│       │   ├── page.tsx         [NEW]
│       │   └── [id]/page.tsx    [NEW]
│       ├── footer/page.tsx      [NEW]
│       └── site/page.tsx        [NEW]
├── components/
│   └── desktop/
│       ├── AboutWindow.tsx      [MODIFY - server component]
│       ├── CvWindow.tsx         [MODIFY - server component]
│       ├── WorkWindow.tsx       [MODIFY - split server/client]
│       ├── WorkWindowClient.tsx [NEW - existing logic moved here]
│       └── DesktopFooter.tsx    [MODIFY - accept footerData prop]
└── styles/
    └── admin.css                [NEW - admin-only styles]
```

---

## Verification Plan

### Setup Commands

```bash
# 1. Install deps
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-underline @tiptap/extension-link isomorphic-dompurify

# 2. Init Prisma
npx prisma init --datasource-provider sqlite

# 3. Run migration
npx prisma migrate dev --name init

# 4. Seed database with existing content  
npx prisma db seed

# 5. Start dev server
npm run dev
```

### Automated Tests

No existing test suite — manual verification below.

### Manual Verification

1. **Auth**: Visit `/admin` → redirects to `/admin/login` ✓  
2. **Login**: Enter correct credentials → redirects to `/admin` dashboard ✓  
3. **About editor**: Edit bio → click Save → open "About me" window on main site → see updated content ✓  
4. **Rich text**: Use color picker, bold, italic → toggle to HTML view → see correct HTML → toggle back ✓  
5. **CV editor**: Add a new award entry → save → open CV window → see new entry ✓  
6. **Projects**: Create new project → fill in all fields → upload images → publish → open Work window → see project ✓  
7. **Image reorder**: Drag images in project editor → save → verify new order in Work window ✓  
8. **Footer**: Edit email → save → expand footer on main site → see updated email ✓  
9. **Seed integrity**: All original content from `lib/data.ts` should appear on first load ✓
