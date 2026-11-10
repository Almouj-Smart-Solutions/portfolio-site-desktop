"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminJson } from "@/lib/admin-fetch";

type LinkRow = { label: string; url: string };
type DownloadRow = { label: string; url: string; filename: string };

type Footer = {
  authorName: string;
  email: string;
  copyright: string;
  disciplineLeft: string;
  disciplineCenter: string;
  disciplineRight: string;
  links: LinkRow[];
  downloads: DownloadRow[];
};

const empty: Footer = {
  authorName: "",
  email: "",
  copyright: "",
  disciplineLeft: "",
  disciplineCenter: "",
  disciplineRight: "",
  links: [],
  downloads: [],
};

export default function FooterAdminPage() {
  const [footer, setFooter] = useState<Footer>(empty);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJson<Footer | null>("/api/admin/footer")
      .then((data) => {
        if (!data) return;
        setFooter({
          authorName: data.authorName,
          email: data.email,
          copyright: data.copyright,
          disciplineLeft: data.disciplineLeft,
          disciplineCenter: data.disciplineCenter,
          disciplineRight: data.disciplineRight,
          links: data.links.map((link) => ({ label: link.label, url: link.url })),
          downloads: data.downloads.map((item) => ({
            label: item.label,
            url: item.url,
            filename: item.filename,
          })),
        });
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  function setField(key: keyof Footer, value: string) {
    setFooter((current) => ({ ...current, [key]: value }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      await adminJson("/api/admin/footer", "PUT", footer);
      setStatus("Saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-stack" onSubmit={onSave}>
      <div>
        <h1 className="admin-title">Footer</h1>
        <p className="admin-lead">Name, email, disciplines, social links, and downloads. A download with an empty URL opens the work window.</p>
      </div>

      {(["authorName", "email", "copyright", "disciplineLeft", "disciplineCenter", "disciplineRight"] as const).map((key) => (
        <label className="admin-field" key={key}>
          {key}
          <input value={footer[key]} onChange={(event) => setField(key, event.target.value)} />
        </label>
      ))}

      <section className="admin-stack">
        <strong>Links</strong>
        {footer.links.map((link, index) => (
          <div className="admin-row" key={index}>
            <input
              value={link.label}
              placeholder="Label"
              onChange={(event) => {
                const links = [...footer.links];
                links[index] = { ...link, label: event.target.value };
                setFooter({ ...footer, links });
              }}
            />
            <input
              value={link.url}
              placeholder="URL"
              onChange={(event) => {
                const links = [...footer.links];
                links[index] = { ...link, url: event.target.value };
                setFooter({ ...footer, links });
              }}
            />
            <button
              className="admin-btn danger"
              type="button"
              onClick={() => setFooter({ ...footer, links: footer.links.filter((_, item) => item !== index) })}
            >
              Remove
            </button>
          </div>
        ))}
        <button className="admin-btn" type="button" onClick={() => setFooter({ ...footer, links: [...footer.links, { label: "", url: "" }] })}>
          Add link
        </button>
      </section>

      <section className="admin-stack">
        <strong>Downloads</strong>
        {footer.downloads.map((item, index) => (
          <div className="admin-row" key={index}>
            <input
              value={item.label}
              placeholder="Label"
              onChange={(event) => {
                const downloads = [...footer.downloads];
                downloads[index] = { ...item, label: event.target.value };
                setFooter({ ...footer, downloads });
              }}
            />
            <input
              value={item.url}
              placeholder="URL"
              onChange={(event) => {
                const downloads = [...footer.downloads];
                downloads[index] = { ...item, url: event.target.value };
                setFooter({ ...footer, downloads });
              }}
            />
            <input
              value={item.filename}
              placeholder="Filename"
              onChange={(event) => {
                const downloads = [...footer.downloads];
                downloads[index] = { ...item, filename: event.target.value };
                setFooter({ ...footer, downloads });
              }}
            />
            <button
              className="admin-btn danger"
              type="button"
              onClick={() => setFooter({ ...footer, downloads: footer.downloads.filter((_, itemIndex) => itemIndex !== index) })}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="admin-btn"
          type="button"
          onClick={() => setFooter({ ...footer, downloads: [...footer.downloads, { label: "", url: "", filename: "" }] })}
        >
          Add download
        </button>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}
      {status ? <p className="admin-ok">{status}</p> : null}
      <button className="admin-btn primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save footer"}
      </button>
    </form>
  );
}
