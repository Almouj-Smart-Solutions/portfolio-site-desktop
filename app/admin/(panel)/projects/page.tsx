"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJson } from "@/lib/admin-fetch";

type ProjectRow = {
  id: number;
  title: string;
  year: number;
  published: boolean;
  images: { id: number }[];
};

export default function ProjectsAdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setProjects(await adminJson<ProjectRow[]>("/api/admin/projects"));
  }

  useEffect(() => {
    load().catch((reason: Error) => setError(reason.message));
  }, []);

  async function createProject() {
    setCreating(true);
    setError("");
    try {
      const project = await adminJson<{ id: number }>("/api/admin/projects", "POST", {
        title: "New Project",
        published: false,
      });
      router.push(`/admin/projects/${project.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create a project.");
      setCreating(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this project?")) return;
    setError("");
    try {
      await adminJson(`/api/admin/projects/${id}`, "DELETE");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete that project.");
    }
  }

  async function dropOn(targetId: number) {
    if (dragId === null || dragId === targetId) return;
    const next = [...projects];
    const from = next.findIndex((project) => project.id === dragId);
    const to = next.findIndex((project) => project.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setProjects(next);
    setDragId(null);
    try {
      await adminJson("/api/admin/projects", "PUT", {
        order: next.map((project, index) => ({ id: project.id, order: index })),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save the new order.");
      await load();
    }
  }

  return (
    <div className="admin-stack">
      <div className="admin-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="admin-title">Projects</h1>
          <p className="admin-lead">Drag a row to change the order on the work volume.</p>
        </div>
        <button className="admin-btn primary" type="button" onClick={createProject} disabled={creating}>
          {creating ? "Creating…" : "New project"}
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Status</th>
            <th>Images</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              draggable
              onDragStart={() => setDragId(project.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(project.id)}
            >
              <td>{project.title}</td>
              <td>{project.year}</td>
              <td>{project.published ? "Published" : "Draft"}</td>
              <td>{project.images.length}</td>
              <td className="admin-actions">
                <button className="admin-btn" type="button" onClick={() => router.push(`/admin/projects/${project.id}`)}>
                  Edit
                </button>
                <button className="admin-btn danger" type="button" onClick={() => remove(project.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}
