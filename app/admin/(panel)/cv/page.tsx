"use client";

import { useEffect, useState } from "react";
import { adminJson } from "@/lib/admin-fetch";

type Tab = "education" | "research" | "awards" | "experience";

type Field = { key: string; label: string; multiline?: boolean };

type Row = { id: number; position: number } & Record<string, string | number>;

const tabs: { id: Tab; label: string; endpoint: string; fields: Field[] }[] = [
  {
    id: "education",
    label: "Education",
    endpoint: "/api/admin/cv/education",
    fields: [
      { key: "dateRange", label: "Date range" },
      { key: "degree", label: "Degree" },
      { key: "institution", label: "Institution", multiline: true },
    ],
  },
  {
    id: "research",
    label: "Research",
    endpoint: "/api/admin/cv/research",
    fields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  {
    id: "awards",
    label: "Awards",
    endpoint: "/api/admin/cv/awards",
    fields: [
      { key: "year", label: "Year" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", multiline: true },
    ],
  },
  {
    id: "experience",
    label: "Experience",
    endpoint: "/api/admin/cv/experience",
    fields: [
      { key: "dateRange", label: "Date range" },
      { key: "organization", label: "Organization" },
      { key: "location", label: "Location" },
    ],
  },
];

function blank(fields: Field[]) {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

function payload(fields: Field[], values: Record<string, string | number>, position: number, id?: number) {
  const data: Record<string, string | number> = { position };
  if (id !== undefined) data.id = id;
  for (const field of fields) data[field.key] = values[field.key] ?? "";
  return data;
}

export default function CvAdminPage() {
  const [tab, setTab] = useState<Tab>("education");
  const [rows, setRows] = useState<Record<Tab, Row[]>>({
    education: [],
    research: [],
    awards: [],
    experience: [],
  });
  const [draft, setDraft] = useState<Record<string, string>>(blank(tabs[0].fields));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const current = tabs.find((item) => item.id === tab)!;

  async function load() {
    const data = await adminJson<Record<Tab, Row[]>>("/api/admin/cv");
    setRows({
      education: data.education,
      research: data.research,
      awards: data.awards,
      experience: data.experience,
    });
  }

  useEffect(() => {
    load().catch((reason: Error) => setError(reason.message));
  }, []);

  useEffect(() => {
    setDraft(blank(current.fields));
  }, [tab]);

  async function addEntry() {
    setError("");
    setStatus("");
    try {
      await adminJson(current.endpoint, "POST", payload(current.fields, draft, rows[tab].length));
      setDraft(blank(current.fields));
      await load();
      setStatus("Added.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add that entry.");
    }
  }

  async function saveEntry(row: Row, values: Record<string, string | number>) {
    setError("");
    setStatus("");
    try {
      await adminJson(current.endpoint, "PUT", payload(current.fields, values, row.position, row.id));
      await load();
      setStatus("Saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save that entry.");
    }
  }

  async function deleteEntry(id: number) {
    if (!window.confirm("Delete this entry?")) return;
    setError("");
    try {
      await adminJson(current.endpoint, "DELETE", { id });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete that entry.");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const list = [...rows[tab]];
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(nextIndex, 0, item);
    setError("");
    try {
      await Promise.all(
        list.map((row, position) =>
          adminJson(current.endpoint, "PUT", payload(current.fields, row, position, row.id))
        )
      );
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reorder.");
    }
  }

  return (
    <div>
      <h1 className="admin-title">CV</h1>
      <p className="admin-lead">Education, research, awards, and experience.</p>
      <div className="admin-tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`admin-btn${item.id === tab ? " active" : ""}`}
            type="button"
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="admin-stack">
        {rows[tab].map((row, index) => (
          <EntryCard
            key={row.id}
            row={row}
            fields={current.fields}
            onSave={(values) => saveEntry(row, values)}
            onDelete={() => deleteEntry(row.id)}
            onUp={() => move(index, -1)}
            onDown={() => move(index, 1)}
          />
        ))}

        <div className="admin-card admin-stack">
          <strong>New {current.label.toLowerCase()} entry</strong>
          {current.fields.map((field) => (
            <label className="admin-field" key={field.key}>
              {field.label}
              {field.multiline ? (
                <textarea
                  value={draft[field.key] ?? ""}
                  onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                />
              ) : (
                <input
                  value={draft[field.key] ?? ""}
                  onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                />
              )}
            </label>
          ))}
          <button className="admin-btn" type="button" onClick={addEntry}>
            Add
          </button>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {status ? <p className="admin-ok">{status}</p> : null}
    </div>
  );
}

function EntryCard({
  row,
  fields,
  onSave,
  onDelete,
  onUp,
  onDown,
}: {
  row: Row;
  fields: Field[];
  onSave: (values: Record<string, string | number>) => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const [values, setValues] = useState<Record<string, string | number>>(row);

  useEffect(() => {
    setValues(row);
  }, [row]);

  return (
    <div className="admin-card admin-stack">
      {fields.map((field) => (
        <label className="admin-field" key={field.key}>
          {field.label}
          {field.multiline ? (
            <textarea
              value={String(values[field.key] ?? "")}
              onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
            />
          ) : (
            <input
              value={String(values[field.key] ?? "")}
              onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
            />
          )}
        </label>
      ))}
      <div className="admin-actions">
        <button className="admin-btn" type="button" onClick={onUp}>Up</button>
        <button className="admin-btn" type="button" onClick={onDown}>Down</button>
        <button className="admin-btn primary" type="button" onClick={() => onSave(values)}>Save</button>
        <button className="admin-btn danger" type="button" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
