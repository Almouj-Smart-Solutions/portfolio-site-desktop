"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";

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
  published: boolean;
  images: ProjectImage[];
};

type FieldDef = {
  key: keyof Project;
  label: string;
  multiline?: boolean;
  rows?: number;
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

function MetaPreviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p className="project-preview-meta-row">
      <span className="project-preview-meta-label">{label}</span>{" "}
      <span
        className="project-preview-meta-value"
        dangerouslySetInnerHTML={{ __html: linkifyPreview(value) }}
      />
    </p>
  );
}

export default function ProjectEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const essayRef = useRef<HTMLTextAreaElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
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
      })
      .catch((reason: Error) => setError(reason.message));
  }, [params.id]);

  function update(key: keyof Project, value: string | number | boolean) {
    setProject((current) => (current ? { ...current, [key]: value } : current));
  }

  function wrapEssaySelection(kind: "heading" | "body" | "quote") {
    const el = essayRef.current;
    if (!el || !project) return;
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
        teamLabel: project.teamLabel,
        team: project.team,
        specificRoles: project.specificRoles,
        timeline: project.timeline,
        summary: project.summary,
        essay: project.essay,
        tags,
        published: project.published,
      });
      setProject(saved);
      setStatus("Saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function upload(files: FileList | File[]) {
    if (!project || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("images", file));
    setError("");
    const response = await fetch(`/api/admin/projects/${project.id}`, { method: "PATCH", body: form });
    if (!response.ok) {
      setError(await response.text());
      return;
    }
    const created = (await response.json()) as ProjectImage[];
    setImages((current) => [...current, ...created]);
    setStatus("Images uploaded.");
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

  const col2Fields: FieldDef[] = [
    { key: "projectType", label: "project type:" },
    { key: "architect", label: "architect in-charge:" },
    { key: "firm", label: "firm:" },
    { key: "role", label: "position:" },
    { key: "projectFunction", label: "project function:" },
    { key: "awardFeature", label: "award/feature:", multiline: true, rows: 8 },
    { key: "size", label: "size:" },
    { key: "location", label: "location:" },
    { key: "status", label: "status:" },
    { key: "client", label: "client:", multiline: true, rows: 3 },
    { key: "teamLabel", label: "team label:" },
    { key: "team", label: "team value:", multiline: true, rows: 5 },
    { key: "specificRoles", label: "specific role(s):", multiline: true, rows: 6 },
    { key: "summary", label: "SUMMARY:", multiline: true, rows: 4 },
    { key: "timeline", label: "timeline / year line:" },
  ];

  const sizeLocation = [project.size, project.location].filter(Boolean).join("/");

  return (
    <form className="admin-stack project-editor" onSubmit={onSave}>
      <div className="admin-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="admin-title">{project.title || "Project"}</h1>
          <p className="admin-lead">Edit in the same three-column format as the Work window.</p>
        </div>
        <div className="admin-row">
          <button className="admin-btn" type="button" onClick={() => router.push("/admin/projects")}>
            Back
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
            {tags.map((tag) => (
              <span className="admin-chip" key={tag}>
                {tag}
                <button className="admin-btn" type="button" onClick={() => setTags(tags.filter((item) => item !== tag))}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="admin-row">
            <input
              value={tagDraft}
              placeholder="Add a tag"
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                const next = tagDraft.trim();
                if (!next || tags.includes(next)) return;
                setTags([...tags, next]);
                setTagDraft("");
              }}
            />
            <button
              className="admin-btn"
              type="button"
              onClick={() => {
                const next = tagDraft.trim();
                if (!next || tags.includes(next)) return;
                setTags([...tags, next]);
                setTagDraft("");
              }}
            >
              Add tag
            </button>
          </div>
        </div>
      </section>

      <section className="project-editor-columns">
        <div className="project-editor-col admin-card">
          <header className="project-editor-col-head">
            <span>Column 1</span>
            <small>title · subtitle</small>
          </header>
          <Field
            label="title"
            hint="SemiBold"
            value={project.title}
            onChange={(value) => update("title", value)}
          />
          <Field
            label="subtitle"
            hint="Light"
            value={project.subtitle}
            onChange={(value) => update("subtitle", value)}
          />
        </div>

        <div className="project-editor-col admin-card">
          <header className="project-editor-col-head">
            <span>Column 2</span>
            <small>meta · summary · timeline</small>
          </header>
          {col2Fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              hint={field.multiline ? undefined : "Bold label / Light value"}
              value={String(project[field.key] ?? "")}
              onChange={(value) => update(field.key, value)}
              multiline={field.multiline}
              rows={field.rows}
            />
          ))}
        </div>

        <div className="project-editor-col admin-card">
          <header className="project-editor-col-head">
            <span>Column 3</span>
            <small>brief · research essay</small>
          </header>
          <div className="admin-row">
            <button className="admin-btn" type="button" onClick={() => wrapEssaySelection("heading")}>
              Wrap as heading
            </button>
            <button className="admin-btn" type="button" onClick={() => wrapEssaySelection("body")}>
              Wrap as body
            </button>
            <button className="admin-btn" type="button" onClick={() => wrapEssaySelection("quote")}>
              Wrap as quote
            </button>
          </div>
          <p className="admin-muted" style={{ marginBottom: 0 }}>
            Select text, then wrap. Headings = Bold, body = Regular, quote = Light Italic.
          </p>
          <label className="admin-field">
            essay
            <textarea
              ref={essayRef}
              value={project.essay}
              onChange={(event) => update("essay", event.target.value)}
              style={{ minHeight: 420 }}
            />
          </label>
        </div>
      </section>

      <section className="project-preview admin-card">
        <header className="project-editor-col-head">
          <span>Live preview</span>
          <small>Work window layout</small>
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
            <p className="project-preview-title">{project.title || "Title"}</p>
            {project.subtitle ? <p className="project-preview-subtitle">{project.subtitle}</p> : null}
          </div>

          <div className="project-preview-col">
            <MetaPreviewRow label="project type:" value={project.projectType} />
            <MetaPreviewRow label="architect in-charge:" value={project.architect} />
            <MetaPreviewRow label="firm:" value={project.firm} />
            <MetaPreviewRow label="position:" value={project.role} />
            <MetaPreviewRow label="project function:" value={project.projectFunction} />
            <MetaPreviewRow label="award/feature:" value={project.awardFeature} />
            <MetaPreviewRow label="size/location:" value={sizeLocation} />
            <MetaPreviewRow label="status:" value={project.status} />
            <MetaPreviewRow label="client:" value={project.client} />
            <MetaPreviewRow label={project.teamLabel || "team:"} value={project.team} />
            <MetaPreviewRow label="specific role(s):" value={project.specificRoles} />
            {project.summary ? (
              <p className="project-preview-summary">
                <span>SUMMARY:</span> {project.summary}
              </p>
            ) : null}
            {project.timeline ? <p className="project-preview-timeline">{project.timeline}</p> : null}
          </div>

          <div className="project-preview-col">
            {essayPreview ? (
              <div className="project-preview-essay" dangerouslySetInnerHTML={{ __html: essayPreview }} />
            ) : (
              <p className="admin-muted">Essay preview appears here.</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-stack admin-card">
        <header className="project-editor-col-head">
          <span>Images</span>
          <small>carousel above the three columns</small>
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
