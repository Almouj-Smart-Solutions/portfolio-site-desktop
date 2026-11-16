export type LayoutRowKind =
  | "title"
  | "subtitle"
  | "meta"
  | "sizeLocation"
  | "summary"
  | "timeline"
  | "essay"
  | "custom";

export type ProjectLayoutRow = {
  id: string;
  kind: LayoutRowKind;
  column: 1 | 2 | 3;
  label: string;
  field?: string;
  visible: boolean;
  /** Space after this row, in em */
  spacingAfter: number;
  /** Only used by custom rows */
  value?: string;
};

export type ProjectLayout = {
  rows: ProjectLayoutRow[];
};

export type ProjectFieldSource = {
  title?: string;
  subtitle?: string;
  projectType?: string;
  architect?: string;
  firm?: string;
  role?: string;
  position?: string;
  projectFunction?: string;
  awardFeature?: string;
  size?: string;
  location?: string;
  status?: string;
  client?: string;
  teamLabel?: string;
  team?: string;
  specificRoles?: string;
  timeline?: string;
  summary?: string;
  essay?: string;
};

const META_DEFAULTS: Array<{ id: string; label: string; field: string; spacingAfter?: number }> = [
  { id: "projectType", label: "project type:", field: "projectType" },
  { id: "architect", label: "architect in-charge:", field: "architect" },
  { id: "firm", label: "firm:", field: "firm" },
  { id: "role", label: "position:", field: "role" },
  { id: "projectFunction", label: "project function:", field: "projectFunction" },
  { id: "awardFeature", label: "award/feature:", field: "awardFeature", spacingAfter: 0.55 },
  { id: "sizeLocation", label: "size/location:", field: "sizeLocation" },
  { id: "status", label: "status:", field: "status" },
  { id: "client", label: "client:", field: "client" },
  { id: "team", label: "team:", field: "team" },
  { id: "specificRoles", label: "specific role(s):", field: "specificRoles" },
];

export function createRowId(prefix = "row") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultProjectLayout(source?: ProjectFieldSource): ProjectLayout {
  const teamLabel = source?.teamLabel?.trim() || "team:";
  const rows: ProjectLayoutRow[] = [
    {
      id: "title",
      kind: "title",
      column: 1,
      label: "title",
      field: "title",
      visible: true,
      spacingAfter: 0.35,
    },
    {
      id: "subtitle",
      kind: "subtitle",
      column: 1,
      label: "subtitle",
      field: "subtitle",
      visible: true,
      spacingAfter: 0,
    },
    ...META_DEFAULTS.map((meta) => ({
      id: meta.id,
      kind: (meta.id === "sizeLocation" ? "sizeLocation" : "meta") as LayoutRowKind,
      column: 2 as const,
      label: meta.id === "team" ? teamLabel : meta.label,
      field: meta.field,
      visible: true,
      spacingAfter: meta.spacingAfter ?? 0.55,
    })),
    {
      id: "summary",
      kind: "summary",
      column: 2,
      label: "SUMMARY:",
      field: "summary",
      visible: true,
      spacingAfter: 0.75,
    },
    {
      id: "timeline",
      kind: "timeline",
      column: 2,
      label: "timeline",
      field: "timeline",
      visible: true,
      spacingAfter: 0,
    },
    {
      id: "essay",
      kind: "essay",
      column: 3,
      label: "essay",
      field: "essay",
      visible: true,
      spacingAfter: 0.9,
    },
  ];
  return { rows };
}

export function parseProjectLayout(raw: string | null | undefined, source?: ProjectFieldSource): ProjectLayout {
  if (!raw?.trim()) return defaultProjectLayout(source);
  try {
    const parsed = JSON.parse(raw) as Partial<ProjectLayout>;
    if (!parsed || !Array.isArray(parsed.rows) || parsed.rows.length === 0) {
      return defaultProjectLayout(source);
    }
    const rows = parsed.rows
      .filter((row): row is ProjectLayoutRow => Boolean(row && row.id && row.kind && row.column))
      .map((row) => ({
        id: String(row.id),
        kind: row.kind,
        column: (row.column === 1 || row.column === 3 ? row.column : 2) as 1 | 2 | 3,
        label: typeof row.label === "string" ? row.label : "",
        field: typeof row.field === "string" ? row.field : undefined,
        visible: row.visible !== false,
        spacingAfter: typeof row.spacingAfter === "number" && Number.isFinite(row.spacingAfter) ? row.spacingAfter : 0.55,
        value: typeof row.value === "string" ? row.value : undefined,
      }));
    return rows.length ? { rows } : defaultProjectLayout(source);
  } catch {
    return defaultProjectLayout(source);
  }
}

export function stringifyProjectLayout(layout: ProjectLayout) {
  return JSON.stringify(layout);
}

export function rowsForColumn(layout: ProjectLayout, column: 1 | 2 | 3) {
  return layout.rows.filter((row) => row.column === column);
}

export function resolveRowValue(row: ProjectLayoutRow, source: ProjectFieldSource): string {
  if (row.kind === "custom") return row.value ?? "";
  if (row.kind === "sizeLocation" || row.field === "sizeLocation") {
    return [source.size, source.location].filter(Boolean).join("/");
  }
  const field = row.field;
  if (!field) return "";
  if (field === "role" || field === "position") {
    return source.role ?? source.position ?? "";
  }
  const record = source as Record<string, string | undefined>;
  return record[field] ?? "";
}

export function isMultilineField(field?: string, kind?: LayoutRowKind) {
  if (kind === "essay" || kind === "summary" || kind === "custom") return true;
  return ["awardFeature", "client", "team", "specificRoles", "summary", "essay"].includes(field ?? "");
}
