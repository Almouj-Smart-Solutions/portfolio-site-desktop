export type LayoutRowKind =
  | "title"
  | "subtitle"
  | "meta"
  | "sizeLocation"
  | "summary"
  | "timeline"
  | "essay"
  | "text"
  | "html"
  | "label"
  | "tags"
  | "image"
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
  /** Used by custom / text / html / label / image rows */
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
  tags?: string[];
  images?: string[];
};

export type RowTypeOption = {
  id: string;
  kind: LayoutRowKind;
  label: string;
  description: string;
  field?: string;
  defaultLabel: string;
  defaultValue?: string;
  uniqueField?: boolean;
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

/** Options shown in the Add row picker. */
export const ROW_TYPE_OPTIONS: RowTypeOption[] = [
  { id: "title", kind: "title", label: "Title", description: "Project title", field: "title", defaultLabel: "title", uniqueField: true },
  { id: "subtitle", kind: "subtitle", label: "Subtitle", description: "Secondary title line", field: "subtitle", defaultLabel: "subtitle", uniqueField: true },
  { id: "label", kind: "label", label: "Label", description: "Bold label only", defaultLabel: "label:", defaultValue: "" },
  { id: "text", kind: "text", label: "Text", description: "Plain text block", defaultLabel: "", defaultValue: "New text" },
  { id: "html", kind: "html", label: "HTML", description: "HTML / rich text block", defaultLabel: "", defaultValue: "<p>New HTML</p>" },
  { id: "tags", kind: "tags", label: "Tags", description: "Project tags list", defaultLabel: "tags:", uniqueField: true },
  { id: "image", kind: "image", label: "Image", description: "Single image by URL", defaultLabel: "", defaultValue: "" },
  { id: "summary", kind: "summary", label: "Summary", description: "SUMMARY block", field: "summary", defaultLabel: "SUMMARY:", uniqueField: true },
  { id: "timeline", kind: "timeline", label: "Timeline", description: "Year / timeline line", field: "timeline", defaultLabel: "timeline", uniqueField: true },
  { id: "essay", kind: "essay", label: "Essay / HTML essay", description: "Main essay column content", field: "essay", defaultLabel: "essay", uniqueField: true },
  { id: "projectType", kind: "meta", label: "Project type", description: "Meta field", field: "projectType", defaultLabel: "project type:", uniqueField: true },
  { id: "architect", kind: "meta", label: "Architect", description: "Meta field", field: "architect", defaultLabel: "architect in-charge:", uniqueField: true },
  { id: "firm", kind: "meta", label: "Firm", description: "Meta field", field: "firm", defaultLabel: "firm:", uniqueField: true },
  { id: "role", kind: "meta", label: "Position", description: "Meta field", field: "role", defaultLabel: "position:", uniqueField: true },
  { id: "projectFunction", kind: "meta", label: "Project function", description: "Meta field", field: "projectFunction", defaultLabel: "project function:", uniqueField: true },
  { id: "awardFeature", kind: "meta", label: "Award / feature", description: "Meta field", field: "awardFeature", defaultLabel: "award/feature:", uniqueField: true },
  { id: "sizeLocation", kind: "sizeLocation", label: "Size / location", description: "Combined size and location", field: "sizeLocation", defaultLabel: "size/location:", uniqueField: true },
  { id: "status", kind: "meta", label: "Status", description: "Meta field", field: "status", defaultLabel: "status:", uniqueField: true },
  { id: "client", kind: "meta", label: "Client", description: "Meta field", field: "client", defaultLabel: "client:", uniqueField: true },
  { id: "team", kind: "meta", label: "Team", description: "Meta field", field: "team", defaultLabel: "team:", uniqueField: true },
  { id: "specificRoles", kind: "meta", label: "Specific role(s)", description: "Meta field", field: "specificRoles", defaultLabel: "specific role(s):", uniqueField: true },
  { id: "custom", kind: "custom", label: "Custom", description: "Label + free text", defaultLabel: "label:", defaultValue: "new text" },
];

export function createRowId(prefix = "row") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createRowFromOption(option: RowTypeOption, column: 1 | 2 | 3): ProjectLayoutRow {
  return {
    id: createRowId(option.id),
    kind: option.kind,
    column,
    label: option.defaultLabel,
    field: option.field,
    visible: true,
    spacingAfter: option.kind === "title" ? 0.35 : 0.55,
    value: option.defaultValue,
  };
}

export function availableRowOptions(layout: ProjectLayout): RowTypeOption[] {
  const usedFields = new Set(
    layout.rows.map((row) => row.field).filter((field): field is string => Boolean(field)),
  );
  const usedKinds = new Set(layout.rows.map((row) => row.kind));

  return ROW_TYPE_OPTIONS.filter((option) => {
    if (option.uniqueField && option.field && usedFields.has(option.field)) return false;
    if (option.uniqueField && !option.field && usedKinds.has(option.kind) && option.kind === "tags") return false;
    return true;
  });
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
  if (row.kind === "custom" || row.kind === "text" || row.kind === "html" || row.kind === "label" || row.kind === "image") {
    return row.value ?? "";
  }
  if (row.kind === "tags") {
    return (source.tags ?? []).join(", ");
  }
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
  if (kind === "essay" || kind === "summary" || kind === "custom" || kind === "text" || kind === "html") return true;
  return ["awardFeature", "client", "team", "specificRoles", "summary", "essay"].includes(field ?? "");
}
