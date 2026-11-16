"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";
import {
  availableRowOptions,
  createRowFromOption,
  defaultProjectLayout,
  isMultilineField,
  parseProjectLayout,
  resolveRowValue,
  rowsForColumn,
  stringifyProjectLayout,
  type ProjectLayout,
  type ProjectLayoutRow,
  type RowTypeOption,
} from "@/lib/project-layout";

type ProjectImage = { id: number; url: string; order: number };

type Project = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  year: number;
  projectType: string;
  architect: string;
  firm: string;
  role: string;
  projectFunction: string;
  awardFeature: string;
  size: string;
  location: string;
  status: string;
  client: string;
  teamLabel: string;
  team: string;
  specificRoles: string;
  timeline: string;
  summary: string;
  essay: string;
  tags: string;
  layoutJson: string;
  published: boolean;
  images: ProjectImage[];
};

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="admin-field">
      <span>
        {label}
        {hint ? <span className="admin-field-hint"> · {hint}</span> : null}
      </span>
      {multiline ? (
        <textarea rows={rows} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function SpacingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(value);

  return (
    <label className="layout-spacing">
      Space after
      <input
        type="text"
        inputMode="decimal"
        value={shown}
        onFocus={() => setDraft(String(value))}
        onChange={(event) => {
          const raw = event.target.value.trim();
          setDraft(raw);
          if (raw === "" || raw === "-" || raw === "." || raw === "-.") return;
          const next = Number(raw);
          if (Number.isFinite(next)) onChange(Math.min(4, Math.max(-2, next)));
        }}
        onBlur={() => {
          const next = Number(draft);
          onChange(Number.isFinite(next) ? Math.min(4, Math.max(-2, next)) : 0);
          setDraft(null);
        }}
      />
      <span>em</span>
    </label>
  );
}

function applyFieldValue(project: Project, field: string | undefined, value: string): Project {
  if (!field || field === "sizeLocation") return project;
  if (field === "position") return { ...project, role: value };
  if (field in project) {
    return { ...project, [field]: value } as Project;
  }
  return project;
}

function getRowFieldValue(project: Project, row: ProjectLayoutRow) {
  if (row.kind === "custom" || row.kind === "text" || row.kind === "html" || row.kind === "label" || row.kind === "image") {
    return row.value ?? "";
  }
  if (row.kind === "sizeLocation") return "";
  if (row.field === "role" || row.field === "position") return project.role;
  if (row.field && row.field in project) return String(project[row.field as keyof Project] ?? "");
  return resolveRowValue(row, { ...project, position: project.role });
}

function PreviewRowContent({
  row,
  project,
  tags,
  essayHtml,
}: {
  row: ProjectLayoutRow;
  project: Project;
  tags: string[];
  essayHtml: string;
}) {
  const source = { ...project, position: project.role, tags };
  const value = resolveRowValue(row, source);

  if (row.kind === "title") {
    return <p className="project-preview-title">{value || "Title"}</p>;
  }
  if (row.kind === "subtitle") {
    return <p className="project-preview-subtitle">{value || "Subtitle"}</p>;
  }
  if (row.kind === "label") {
    return (
      <p className="project-preview-meta-row">
        <span className="project-preview-meta-label">{row.label || value || "Label"}</span>
      </p>
    );
  }
  if (row.kind === "text") {
    return <p className="project-preview-meta-value" style={{ whiteSpace: "pre-wrap" }}>{value || "Text…"}</p>;
  }
  if (row.kind === "html" || row.kind === "essay") {
    const html = row.kind === "essay" ? essayHtml || escapeHtml(value) : value;
    if (html) {
      return <div className="project-preview-essay" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <p className="admin-muted">{row.kind === "essay" ? "Essay…" : "HTML…"}</p>;
  }
  if (row.kind === "tags") {
    return (
      <p className="project-preview-meta-row">
        {row.label ? <span className="project-preview-meta-label">{row.label}</span> : null}{" "}
        <span className="project-preview-meta-value">{tags.length ? tags.join(", ") : "No tags"}</span>
      </p>
    );
  }
  if (row.kind === "image") {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value} alt="" className="preview-inline-image" />
    ) : (
      <p className="admin-muted">Image URL…</p>
    );
  }
  if (row.kind === "summary") {
    return (
      <p className="project-preview-summary">
        {row.label ? <span>{row.label}</span> : null} {value || "Summary…"}
      </p>
    );
  }
  if (row.kind === "timeline") {
    return <p className="project-preview-timeline">{value || "Timeline…"}</p>;
  }
  return (
    <p className="project-preview-meta-row">
      {row.label ? <span className="project-preview-meta-label">{row.label}</span> : null}{" "}
      <span className="project-preview-meta-value">{value || "—"}</span>
    </p>
  );
}

function RowEditPopup({
  row,
  project,
  onClose,
  onUpdateRow,
  onProjectChange,
  onDelete,
}: {
  row: ProjectLayoutRow;
  project: Project;
  onClose: () => void;
  onUpdateRow: (patch: Partial<ProjectLayoutRow>) => void;
  onProjectChange: (project: Project) => void;
  onDelete?: () => void;
}) {
  const essayRef = useRef<HTMLTextAreaElement>(null);
  const multiline = isMultilineField(row.field, row.kind);

  function wrapEssaySelection(kind: "heading" | "body" | "quote") {
    const el = essayRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = project.essay.slice(start, end).trim() || "…";
    const className =
      kind === "heading" ? "essay-heading" : kind === "quote" ? "essay-quote" : "essay-body";
    const wrapped = `<p class="${className}">${selected}</p>`;
    const next = `${project.essay.slice(0, start)}${wrapped}${project.essay.slice(end)}`;
    onProjectChange({ ...project, essay: next });
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + wrapped.length;
      el.setSelectionRange(caret, caret);
    });
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="row-edit-overlay" onClick={onClose} role="presentation">
      <div
        className="row-edit-popup admin-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit row"
      >
        <header className="row-edit-popup-head">
          <div>
            <strong>Edit element</strong>
            <p className="admin-muted" style={{ margin: 0 }}>
              Column {row.column} · {row.kind}
            </p>
          </div>
          <button type="button" className="admin-btn" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="admin-row">
          <button
            type="button"
            className={`admin-btn ${row.visible ? "active" : ""}`}
            onClick={() => onUpdateRow({ visible: !row.visible })}
          >
            {row.visible ? "Shown on site" : "Hidden on site"}
          </button>
          <SpacingInput value={row.spacingAfter} onChange={(next) => onUpdateRow({ spacingAfter: next })} />
          {onDelete ? (
            <button type="button" className="admin-btn danger" onClick={onDelete}>
              Delete row
            </button>
          ) : null}
        </div>

        {row.kind !== "tags" ? (
          <Field
            label={
              row.kind === "title" || row.kind === "subtitle" || row.kind === "timeline" || row.kind === "essay"
                ? "Label (admin)"
                : "Label"
            }
            value={row.label}
            onChange={(next) => {
              onUpdateRow({ label: next });
              if (row.field === "team") onProjectChange({ ...project, teamLabel: next || "team:" });
            }}
          />
        ) : (
          <Field
            label="Label"
            value={row.label}
            onChange={(next) => onUpdateRow({ label: next })}
          />
        )}

        {row.kind === "sizeLocation" ? (
          <div className="admin-grid">
            <Field label="Size" value={project.size} onChange={(next) => onProjectChange({ ...project, size: next })} />
            <Field
              label="Location"
              value={project.location}
              onChange={(next) => onProjectChange({ ...project, location: next })}
            />
          </div>
        ) : row.kind === "tags" ? (
          <p className="admin-muted" style={{ margin: 0 }}>
            Tags are managed in the Tags section above this layout.
          </p>
        ) : row.kind === "custom" || row.kind === "text" || row.kind === "label" || row.kind === "image" ? (
          <Field
            label={row.kind === "image" ? "Image URL" : "Value"}
            value={row.value ?? ""}
            multiline={row.kind !== "image" && row.kind !== "label"}
            rows={4}
            onChange={(next) => onUpdateRow({ value: next })}
          />
        ) : row.kind === "html" ? (
          <Field
            label="HTML"
            value={row.value ?? ""}
            multiline
            rows={8}
            onChange={(next) => onUpdateRow({ value: next })}
          />
        ) : row.kind === "essay" ? (
          <div className="admin-stack">
            <div className="admin-row">
              <button type="button" className="admin-btn" onClick={() => wrapEssaySelection("heading")}>
                Wrap as heading
              </button>
              <button type="button" className="admin-btn" onClick={() => wrapEssaySelection("body")}>
                as body
              </button>
              <button type="button" className="admin-btn" onClick={() => wrapEssaySelection("quote")}>
                as quote
              </button>
            </div>
            <label className="admin-field">
              Essay
              <textarea
                ref={essayRef}
                value={project.essay}
                onChange={(event) => onProjectChange({ ...project, essay: event.target.value })}
                style={{ minHeight: 260 }}
              />
            </label>
          </div>
        ) : (
          <Field
            label="Value"
            value={getRowFieldValue(project, row)}
            multiline={multiline}
            rows={multiline ? 6 : 3}
            onChange={(next) => {
              if (row.field === "role" || row.field === "position") {
                onProjectChange({ ...project, role: next });
                return;
              }
              onProjectChange(applyFieldValue(project, row.field, next));
            }}
          />
        )}

        <div className="admin-row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="admin-btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [layout, setLayout] = useState<ProjectLayout>(defaultProjectLayout());
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [imageDragId, setImageDragId] = useState<number | null>(null);
  const [rowDragId, setRowDragId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [addMenuColumn, setAddMenuColumn] = useState<1 | 2 | 3 | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJson<Project>(`/api/admin/projects/${params.id}`)
      .then((data) => {
        setProject(data);
        setTags(parseTags(data.tags));
        setImages(data.images);
        setLayout(
          parseProjectLayout(data.layoutJson, {
            teamLabel: data.teamLabel,
          }),
        );
      })
      .catch((reason: Error) => setError(reason.message));
  }, [params.id]);

  function update(key: keyof Project, value: string | number | boolean) {
    setProject((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateRow(id: string, patch: Partial<ProjectLayoutRow>) {
    setLayout((current) => ({
      rows: current.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function moveRow(column: 1 | 2 | 3, fromId: string, toId: string) {
    if (fromId === toId) return;
    setLayout((current) => {
      const columnRows = rowsForColumn(current, column);
      const from = columnRows.findIndex((row) => row.id === fromId);
      const to = columnRows.findIndex((row) => row.id === toId);
      if (from < 0 || to < 0) return current;
      const nextColumn = [...columnRows];
      const [item] = nextColumn.splice(from, 1);
      nextColumn.splice(to, 0, item);
      const others = current.rows.filter((row) => row.column !== column);
      return { rows: [...others, ...nextColumn] };
    });
  }

  function addRowFromOption(column: 1 | 2 | 3, option: RowTypeOption) {
    const row = createRowFromOption(option, column);
    setLayout((current) => ({ rows: [...current.rows, row] }));
    setAddMenuColumn(null);
    setSelectedRowId(row.id);
  }

  function removeRow(id: string) {
    setLayout((current) => ({ rows: current.rows.filter((row) => row.id !== id) }));
    setSelectedRowId(null);
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!project) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const teamRow = layout.rows.find((row) => row.field === "team");
      const saved = await adminJson<Project>(`/api/admin/projects/${project.id}`, "PUT", {
        title: project.title,
        subtitle: project.subtitle,
        slug: project.slug,
        year: Number(project.year),
        projectType: project.projectType,
        architect: project.architect,
        firm: project.firm,
        role: project.role,
        projectFunction: project.projectFunction,
        awardFeature: project.awardFeature,
        size: project.size,
        location: project.location,
        status: project.status,
        client: project.client,
        teamLabel: teamRow?.label || project.teamLabel || "team:",
        team: project.team,
        specificRoles: project.specificRoles,
        timeline: project.timeline,
        summary: project.summary,
        essay: project.essay,
        tags,
        layoutJson: stringifyProjectLayout(layout),
        published: project.published,
      });
      setProject(saved);
      setLayout(
        parseProjectLayout(saved.layoutJson, {
          teamLabel: saved.teamLabel,
        }),
      );
      setStatus("Saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function upload(files: FileList | File[]) {
    if (!project || files.length === 0) return;
    const list = Array.from(files).filter((file) => file.size > 0);
    if (list.length === 0) {
      setError("No image files selected.");
      return;
    }
    const form = new FormData();
    list.forEach((file) => form.append("images", file));
    setError("");
    setStatus(`Uploading ${list.length} image${list.length === 1 ? "" : "s"}…`);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        body: form,
        credentials: "include",
      });
      const raw = await response.text();
      let payload: { error?: string } | ProjectImage[] | null = null;
      try {
        payload = raw ? (JSON.parse(raw) as { error?: string } | ProjectImage[]) : null;
      } catch {
        payload = null;
      }
      if (!response.ok) {
        const message =
          payload && !Array.isArray(payload) && payload.error
            ? payload.error
            : raw || `Upload failed (${response.status})`;
        setStatus("");
        setError(message);
        return;
      }
      const created = (Array.isArray(payload) ? payload : []) as ProjectImage[];
      setImages((current) => [...current, ...created]);
      setStatus(`Uploaded ${created.length} image${created.length === 1 ? "" : "s"}.`);
    } catch (reason) {
      setStatus("");
      setError(reason instanceof Error ? reason.message : "Upload failed.");
    }
  }

  async function removeImage(imageId: number) {
    if (!project) return;
    setError("");
    try {
      await adminJson(`/api/admin/projects/${project.id}/images/${imageId}`, "DELETE");
      setImages((current) => current.filter((image) => image.id !== imageId));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete that image.");
    }
  }

  async function dropImage(targetId: number) {
    if (!project || imageDragId === null || imageDragId === targetId) return;
    const next = [...images];
    const from = next.findIndex((image) => image.id === imageDragId);
    const to = next.findIndex((image) => image.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setImages(next);
    setImageDragId(null);
    try {
      await adminJson(`/api/admin/projects/${project.id}/images/reorder`, "PUT", {
        order: next.map((image, index) => ({ id: image.id, order: index })),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reorder images.");
    }
  }

  function addTag() {
    const next = tagDraft.trim();
    if (!next || tags.includes(next)) return;
    setTags([...tags, next]);
    setTagDraft("");
  }

  function startEditTag(index: number) {
    setEditingTagIndex(index);
    setEditingTagValue(tags[index] ?? "");
  }

  function commitEditTag() {
    if (editingTagIndex === null) return;
    const next = editingTagValue.trim();
    if (!next) {
      setTags(tags.filter((_, index) => index !== editingTagIndex));
    } else {
      setTags(tags.map((tag, index) => (index === editingTagIndex ? next : tag)));
    }
    setEditingTagIndex(null);
    setEditingTagValue("");
  }

  const essayHtml = useMemo(() => {
    if (!project?.essay) return "";
    if (/<[a-z][\s\S]*>/i.test(project.essay)) return project.essay;
    return project.essay
      .split(/\n\n+/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => `<p class="essay-body">${escapeHtml(para)}</p>`)
      .join("");
  }, [project?.essay]);

  const selectedRow = selectedRowId ? layout.rows.find((row) => row.id === selectedRowId) ?? null : null;

  if (!project) {
    return error ? <p className="admin-error">{error}</p> : <p className="admin-muted">Loading project…</p>;
  }

  return (
    <form className="admin-stack project-editor" onSubmit={onSave}>
      <div className="admin-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="admin-title">{project.title || "Project"}</h1>
          <p className="admin-lead">
            Hover a block for instructions. Drag to sort, click/edit to change, delete to remove. Add row
            picks from available types.
          </p>
        </div>
        <div className="admin-row">
          <button className="admin-btn" type="button" onClick={() => router.push("/admin/projects")}>
            Back
          </button>
          <button
            className="admin-btn"
            type="button"
            onClick={() =>
              setLayout(
                defaultProjectLayout({
                  teamLabel: project.teamLabel,
                }),
              )
            }
          >
            Reset layout
          </button>
          <button className="admin-btn primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save project"}
          </button>
        </div>
      </div>

      <section className="project-editor-settings admin-card">
        <div className="admin-grid">
          <Field label="Slug" value={project.slug} onChange={(value) => update("slug", value)} />
          <Field
            label="Year (sorting)"
            value={project.year}
            onChange={(value) => update("year", Number(value) || 0)}
          />
          <label className="admin-check" style={{ alignSelf: "end", marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={project.published}
              onChange={(event) => update("published", event.target.checked)}
            />
            Published
          </label>
        </div>

        <div className="admin-stack" style={{ marginTop: 12 }}>
          <strong>Tags</strong>
          <div className="admin-chips">
            {tags.map((tag, index) =>
              editingTagIndex === index ? (
                <span className="admin-chip" key={`edit-${index}`}>
                  <input
                    value={editingTagValue}
                    autoFocus
                    onChange={(event) => setEditingTagValue(event.target.value)}
                    onBlur={commitEditTag}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitEditTag();
                      }
                      if (event.key === "Escape") {
                        setEditingTagIndex(null);
                        setEditingTagValue("");
                      }
                    }}
                    style={{ width: 140 }}
                  />
                </span>
              ) : (
                <span className="admin-chip" key={`${tag}-${index}`}>
                  <button type="button" className="admin-chip-edit" onClick={() => startEditTag(index)}>
                    {tag}
                  </button>
                  <button
                    className="admin-btn"
                    type="button"
                    onClick={() => setTags(tags.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    ×
                  </button>
                </span>
              ),
            )}
          </div>
          <div className="admin-row">
            <input
              value={tagDraft}
              placeholder="Add a tag"
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                addTag();
              }}
            />
            <button className="admin-btn" type="button" onClick={addTag}>
              Add tag
            </button>
          </div>
        </div>
      </section>

      <section className="project-preview admin-card interactive-preview">
        <header className="project-editor-col-head">
          <span>Work layout</span>
          <small>select · drag · edit popup</small>
        </header>

        {images[0] ? (
          <div className="project-preview-strip">
            {images.slice(0, 5).map((image) => (
              <img key={image.id} src={image.url} alt="" />
            ))}
          </div>
        ) : null}

        <div className="project-preview-columns">
          {([1, 2, 3] as const).map((column) => {
            const options = availableRowOptions(layout);
            return (
              <div key={column} className="project-preview-col interactive-col">
                <div className="interactive-col-head">
                  <span>Column {column}</span>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => setAddMenuColumn(addMenuColumn === column ? null : column)}
                  >
                    + Add row
                  </button>
                </div>

                {addMenuColumn === column ? (
                  <div className="add-row-menu">
                    <p className="add-row-menu-title">Choose row type</p>
                    <div className="add-row-menu-grid">
                      {options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="add-row-option"
                          onClick={() => addRowFromOption(column, option)}
                        >
                          <strong>{option.label}</strong>
                          <span>{option.description}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" className="admin-btn" onClick={() => setAddMenuColumn(null)}>
                      Cancel
                    </button>
                  </div>
                ) : null}

                {rowsForColumn(layout, column).map((row) => (
                  <div
                    key={row.id}
                    className={[
                      "preview-block",
                      row.visible ? "" : "is-hidden",
                      selectedRowId === row.id ? "is-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ marginBottom: `${row.spacingAfter}em` }}
                    draggable
                    onDragStart={(event) => {
                      setRowDragId(row.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (rowDragId) moveRow(column, rowDragId, row.id);
                      setRowDragId(null);
                    }}
                    onClick={() => setSelectedRowId(row.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedRowId(row.id);
                      }
                    }}
                  >
                    <div className="preview-block-hint">Drag to sort · Click to edit</div>
                    <div className="preview-block-chrome">
                      <span>⋮⋮ {row.visible ? "shown" : "hidden"}</span>
                      <span className="preview-block-actions">
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRowId(row.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeRow(row.id);
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                    <PreviewRowContent row={row} project={project} tags={tags} essayHtml={essayHtml} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="admin-stack admin-card">
        <header className="project-editor-col-head">
          <span>Images</span>
          <small>drag to reorder</small>
        </header>
        <label
          className="admin-drop"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void upload(event.dataTransfer.files);
          }}
        >
          Drop images here or browse
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <div className="admin-images">
          {images.map((image) => (
            <figure
              key={image.id}
              draggable
              onDragStart={() => setImageDragId(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropImage(image.id)}
            >
              <img src={image.url} alt="" />
              <figcaption>
                <span>Drag</span>
                <button className="admin-btn danger" type="button" onClick={() => removeImage(image.id)}>
                  Delete
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}
      {status ? <p className="admin-ok">{status}</p> : null}
      <button className="admin-btn primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save project"}
      </button>

      {selectedRow && project ? (
        <RowEditPopup
          row={selectedRow}
          project={project}
          onClose={() => setSelectedRowId(null)}
          onUpdateRow={(patch) => updateRow(selectedRow.id, patch)}
          onProjectChange={setProject}
          onDelete={() => removeRow(selectedRow.id)}
        />
      ) : null}
    </form>
  );
}
