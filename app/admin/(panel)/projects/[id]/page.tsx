"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";
import {
  createRowId,
  defaultProjectLayout,
  isMultilineField,
  parseProjectLayout,
  resolveRowValue,
  rowsForColumn,
  stringifyProjectLayout,
  type ProjectLayout,
  type ProjectLayoutRow,
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

const URL_PATTERN = /(https?:\/\/[^\s<]+[^.,;:!?)\s])/g;

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

function linkifyPreview(text: string) {
  return escapeHtml(text).replace(URL_PATTERN, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
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

/** Allows typing negatives like -0.2 (plain number inputs reset on "-"). */
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
      Space
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

function LayoutColumnEditor({
  column,
  title,
  hint,
  layout,
  project,
  onLayoutChange,
  onProjectChange,
}: {
  column: 1 | 2 | 3;
  title: string;
  hint: string;
  layout: ProjectLayout;
  project: Project;
  onLayoutChange: (layout: ProjectLayout) => void;
  onProjectChange: (project: Project) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const rows = rowsForColumn(layout, column);

  function updateRow(id: string, patch: Partial<ProjectLayoutRow>) {
    onLayoutChange({
      rows: layout.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    });
  }

  function moveRow(fromId: string, toId: string) {
    if (fromId === toId) return;
    const columnRows = rowsForColumn(layout, column);
    const from = columnRows.findIndex((row) => row.id === fromId);
    const to = columnRows.findIndex((row) => row.id === toId);
    if (from < 0 || to < 0) return;
    const nextColumn = [...columnRows];
    const [item] = nextColumn.splice(from, 1);
    nextColumn.splice(to, 0, item);
    const others = layout.rows.filter((row) => row.column !== column);
    onLayoutChange({ rows: [...others, ...nextColumn] });
  }

  function addCustomRow() {
    const row: ProjectLayoutRow = {
      id: createRowId(`c${column}`),
      kind: "custom",
      column,
      label: "label:",
      visible: true,
      spacingAfter: 0.55,
      value: "",
    };
    onLayoutChange({ rows: [...layout.rows, row] });
  }

  function removeRow(id: string) {
    onLayoutChange({ rows: layout.rows.filter((row) => row.id !== id) });
  }

  return (
    <div className="project-editor-col admin-card">
      <header className="project-editor-col-head">
        <span>Column {column}</span>
        <small>{hint}</small>
      </header>
      <p className="admin-muted" style={{ margin: 0 }}>
        {title}. Drag rows to reorder. Toggle eye to hide/show.
      </p>

      <div className="layout-row-list">
        {rows.map((row) => {
          const value = resolveRowValue(row, {
            ...project,
            position: project.role,
          });
          const multiline = isMultilineField(row.field, row.kind);
          return (
            <article
              key={row.id}
              className={`layout-row ${row.visible ? "" : "is-hidden"}`}
              draggable
              onDragStart={() => setDragId(row.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragId) moveRow(dragId, row.id);
                setDragId(null);
              }}
            >
              <div className="layout-row-toolbar">
                <span className="layout-row-handle" title="Drag to reorder">
                  ⋮⋮
                </span>
                <button
                  type="button"
                  className={`admin-btn ${row.visible ? "active" : ""}`}
                  onClick={() => updateRow(row.id, { visible: !row.visible })}
                  title={row.visible ? "Hide on site" : "Show on site"}
                >
                  {row.visible ? "Shown" : "Hidden"}
                </button>
                <SpacingInput
                  value={row.spacingAfter}
                  onChange={(next) => updateRow(row.id, { spacingAfter: next })}
                />
                {row.kind === "custom" ? (
                  <button type="button" className="admin-btn danger" onClick={() => removeRow(row.id)}>
                    Delete
                  </button>
                ) : null}
              </div>

              {row.kind !== "title" && row.kind !== "subtitle" && row.kind !== "timeline" && row.kind !== "essay" ? (
                <Field
                  label="Label"
                  value={row.label}
                  onChange={(next) => {
                    updateRow(row.id, { label: next });
                    if (row.field === "team") {
                      onProjectChange({ ...project, teamLabel: next || "team:" });
                    }
                  }}
                />
              ) : (
                <Field
                  label="Label (admin only)"
                  value={row.label}
                  onChange={(next) => updateRow(row.id, { label: next })}
                />
              )}

              {row.kind === "sizeLocation" ? (
                <div className="admin-grid">
                  <Field
                    label="Size"
                    value={project.size}
                    onChange={(next) => onProjectChange({ ...project, size: next })}
                  />
                  <Field
                    label="Location"
                    value={project.location}
                    onChange={(next) => onProjectChange({ ...project, location: next })}
                  />
                </div>
              ) : row.kind === "custom" ? (
                <Field
                  label="Value"
                  value={row.value ?? ""}
                  multiline
                  rows={3}
                  onChange={(next) => updateRow(row.id, { value: next })}
                />
              ) : (
                <Field
                  label="Value"
                  value={
                    row.field === "role" || row.field === "position"
                      ? project.role
                      : row.field && row.field in project
                        ? String(project[row.field as keyof Project] ?? "")
                        : value
                  }
                  multiline={multiline}
                  rows={row.kind === "essay" ? 12 : multiline ? 5 : 3}
                  onChange={(next) => {
                    if (row.field === "role" || row.field === "position") {
                      onProjectChange({ ...project, role: next });
                      return;
                    }
                    onProjectChange(applyFieldValue(project, row.field, next));
                  }}
                />
              )}
            </article>
          );
        })}
      </div>

      <button type="button" className="admin-btn" onClick={addCustomRow}>
        Add custom row
      </button>
    </div>
  );
}

export default function ProjectEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const essayRef = useRef<HTMLTextAreaElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [layout, setLayout] = useState<ProjectLayout>(defaultProjectLayout());
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
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

  function wrapEssaySelection(kind: "heading" | "body" | "quote") {
    if (!project) return;
    const el = essayRef.current;
    const essayRow = layout.rows.find((row) => row.kind === "essay");
    const source = essayRow ? project.essay : project.essay;
    if (!el) {
      const selected = source.trim() || "…";
      const className =
        kind === "heading" ? "essay-heading" : kind === "quote" ? "essay-quote" : "essay-body";
      update("essay", `${source}\n<p class="${className}">${selected}</p>`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = project.essay.slice(start, end).trim() || "…";
    const className =
      kind === "heading" ? "essay-heading" : kind === "quote" ? "essay-quote" : "essay-body";
    const wrapped = `<p class="${className}">${selected}</p>`;
    const next = `${project.essay.slice(0, start)}${wrapped}${project.essay.slice(end)}`;
    update("essay", next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + wrapped.length;
      el.setSelectionRange(caret, caret);
    });
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
    if (!project || dragId === null || dragId === targetId) return;
    const next = [...images];
    const from = next.findIndex((image) => image.id === dragId);
    const to = next.findIndex((image) => image.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setImages(next);
    setDragId(null);
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

  const essayPreview = useMemo(() => {
    if (!project?.essay) return "";
    if (/<[a-z][\s\S]*>/i.test(project.essay)) return project.essay;
    return project.essay
      .split(/\n\n+/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => `<p class="essay-body">${escapeHtml(para)}</p>`)
      .join("");
  }, [project?.essay]);

  if (!project) {
    return error ? <p className="admin-error">{error}</p> : <p className="admin-muted">Loading project…</p>;
  }

  const source = { ...project, position: project.role };

  return (
    <form className="admin-stack project-editor" onSubmit={onSave}>
      <div className="admin-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="admin-title">{project.title || "Project"}</h1>
          <p className="admin-lead">
            Hide/show rows, edit labels, set spacing, drag to sort. Current project content is preserved.
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
          <p className="admin-muted" style={{ margin: 0 }}>
            Add, edit (click a tag), or delete tags.
          </p>
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

      <section className="project-editor-columns">
        <LayoutColumnEditor
          column={1}
          title="Title column"
          hint="title · subtitle"
          layout={layout}
          project={project}
          onLayoutChange={setLayout}
          onProjectChange={setProject}
        />
        <LayoutColumnEditor
          column={2}
          title="Meta column"
          hint="labels · values · summary"
          layout={layout}
          project={project}
          onLayoutChange={setLayout}
          onProjectChange={setProject}
        />
        <div className="admin-stack">
          <LayoutColumnEditor
            column={3}
            title="Essay column"
            hint="brief · research"
            layout={layout}
            project={project}
            onLayoutChange={setLayout}
            onProjectChange={setProject}
          />
          <div className="admin-card admin-stack">
            <div className="admin-row">
              <button className="admin-btn" type="button" onClick={() => wrapEssaySelection("heading")}>
                Wrap selection as heading
              </button>
              <button className="admin-btn" type="button" onClick={() => wrapEssaySelection("body")}>
                as body
              </button>
              <button className="admin-btn" type="button" onClick={() => wrapEssaySelection("quote")}>
                as quote
              </button>
            </div>
            <label className="admin-field">
              Essay HTML helper (mirrors column 3 essay value)
              <textarea
                ref={essayRef}
                value={project.essay}
                onChange={(event) => update("essay", event.target.value)}
                style={{ minHeight: 180 }}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="project-preview admin-card">
        <header className="project-editor-col-head">
          <span>Live preview</span>
          <small>respects hide/show, labels, spacing, order</small>
        </header>

        {images[0] ? (
          <div className="project-preview-strip">
            {images.slice(0, 5).map((image) => (
              <img key={image.id} src={image.url} alt="" />
            ))}
          </div>
        ) : null}

        <div className="project-preview-columns">
          <div className="project-preview-col">
            {rowsForColumn(layout, 1)
              .filter((row) => row.visible)
              .map((row) => {
                const value = resolveRowValue(row, source);
                if (!value && row.kind !== "title") return null;
                if (row.kind === "title") {
                  return (
                    <p key={row.id} className="project-preview-title" style={{ marginBottom: `${row.spacingAfter}em` }}>
                      {value || "Title"}
                    </p>
                  );
                }
                if (row.kind === "subtitle") {
                  return (
                    <p
                      key={row.id}
                      className="project-preview-subtitle"
                      style={{ marginBottom: `${row.spacingAfter}em` }}
                    >
                      {value}
                    </p>
                  );
                }
                return (
                  <p key={row.id} className="project-preview-meta-row" style={{ marginBottom: `${row.spacingAfter}em` }}>
                    {row.label ? <span className="project-preview-meta-label">{row.label}</span> : null}{" "}
                    <span
                      className="project-preview-meta-value"
                      dangerouslySetInnerHTML={{ __html: linkifyPreview(value) }}
                    />
                  </p>
                );
              })}
          </div>

          <div className="project-preview-col">
            {rowsForColumn(layout, 2)
              .filter((row) => row.visible)
              .map((row) => {
                const value = resolveRowValue(row, source);
                if (!value) return null;
                if (row.kind === "summary") {
                  return (
                    <p
                      key={row.id}
                      className="project-preview-summary"
                      style={{ marginBottom: `${row.spacingAfter}em` }}
                    >
                      {row.label ? <span>{row.label}</span> : null} {value}
                    </p>
                  );
                }
                if (row.kind === "timeline") {
                  return (
                    <p
                      key={row.id}
                      className="project-preview-timeline"
                      style={{ marginBottom: `${row.spacingAfter}em` }}
                    >
                      {value}
                    </p>
                  );
                }
                return (
                  <p key={row.id} className="project-preview-meta-row" style={{ marginBottom: `${row.spacingAfter}em` }}>
                    {row.label ? <span className="project-preview-meta-label">{row.label}</span> : null}{" "}
                    <span
                      className="project-preview-meta-value"
                      dangerouslySetInnerHTML={{ __html: linkifyPreview(value) }}
                    />
                  </p>
                );
              })}
          </div>

          <div className="project-preview-col">
            {rowsForColumn(layout, 3)
              .filter((row) => row.visible)
              .map((row) => {
                const value = resolveRowValue(row, source);
                if (!value) return null;
                if (row.kind === "essay") {
                  return (
                    <div
                      key={row.id}
                      className="project-preview-essay"
                      style={{ marginBottom: `${row.spacingAfter}em` }}
                      dangerouslySetInnerHTML={{ __html: essayPreview || escapeHtml(value) }}
                    />
                  );
                }
                return (
                  <p key={row.id} style={{ marginBottom: `${row.spacingAfter}em` }}>
                    {row.label ? <strong>{row.label} </strong> : null}
                    {value}
                  </p>
                );
              })}
          </div>
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
              onDragStart={() => setDragId(image.id)}
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
    </form>
  );
}
