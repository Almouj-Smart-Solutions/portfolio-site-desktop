"use client";

import { FormEvent, useEffect, useState } from "react";
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
  team: string;
  specificRoles: string;
  timeline: string;
  summary: string;
  essay: string;
  tags: string;
  published: boolean;
  images: ProjectImage[];
};

const textFields: { key: keyof Project; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle" },
  { key: "slug", label: "Slug" },
  { key: "projectType", label: "Project type" },
  { key: "architect", label: "Architect in-charge" },
  { key: "firm", label: "Firm" },
  { key: "role", label: "Position" },
  { key: "projectFunction", label: "Project function" },
  { key: "size", label: "Size" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "client", label: "Client" },
  { key: "team", label: "Team" },
  { key: "timeline", label: "Timeline" },
];

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export default function ProjectEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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

  if (!project) {
    return error ? <p className="admin-error">{error}</p> : <p className="admin-muted">Loading project…</p>;
  }

  return (
    <form className="admin-stack" onSubmit={onSave}>
      <div className="admin-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="admin-title">{project.title || "Project"}</h1>
          <p className="admin-lead">Fields, tags, essay, and images.</p>
        </div>
        <button className="admin-btn" type="button" onClick={() => router.push("/admin/projects")}>
          Back
        </button>
      </div>

      <div className="admin-grid">
        {textFields.map((field) => (
          <label className="admin-field" key={field.key}>
            {field.label}
            <input
              value={String(project[field.key] ?? "")}
              onChange={(event) => update(field.key, event.target.value)}
            />
          </label>
        ))}
        <label className="admin-field">
          Year
          <input type="number" value={project.year} onChange={(event) => update("year", Number(event.target.value))} />
        </label>
      </div>

      <label className="admin-check">
        <input
          type="checkbox"
          checked={project.published}
          onChange={(event) => update("published", event.target.checked)}
        />
        Published
      </label>

      <div className="admin-stack">
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

      <label className="admin-field">
        Award / feature
        <textarea
          value={project.awardFeature}
          onChange={(event) => update("awardFeature", event.target.value)}
          style={{ minHeight: 160 }}
        />
      </label>
      <label className="admin-field">
        Specific role(s)
        <textarea
          value={project.specificRoles}
          onChange={(event) => update("specificRoles", event.target.value)}
          style={{ minHeight: 100 }}
        />
      </label>
      <label className="admin-field">
        Summary
        <textarea value={project.summary} onChange={(event) => update("summary", event.target.value)} />
      </label>
      <label className="admin-field">
        Essay
        <textarea value={project.essay} onChange={(event) => update("essay", event.target.value)} style={{ minHeight: 220 }} />
      </label>

      <section className="admin-stack">
        <strong>Images</strong>
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
