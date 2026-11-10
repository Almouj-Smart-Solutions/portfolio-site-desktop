"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminJson } from "@/lib/admin-fetch";

type SiteSettings = {
  name: string;
  tagline: string;
  accentPink: string;
  accentOrange: string;
  accentGreen: string;
};

const empty: SiteSettings = {
  name: "",
  tagline: "",
  accentPink: "#F43454",
  accentOrange: "#FB7A04",
  accentGreen: "#83E01B",
};

export default function SiteAdminPage() {
  const [settings, setSettings] = useState<SiteSettings>(empty);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminJson<SiteSettings | null>("/api/admin/site")
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const saved = await adminJson<SiteSettings>("/api/admin/site", "PUT", settings);
      setSettings(saved);
      setStatus("Saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const colors: { key: keyof SiteSettings; label: string }[] = [
    { key: "accentPink", label: "Pink" },
    { key: "accentOrange", label: "Orange" },
    { key: "accentGreen", label: "Green" },
  ];

  return (
    <form className="admin-stack" onSubmit={onSave}>
      <div>
        <h1 className="admin-title">Site</h1>
        <p className="admin-lead">Name, tagline, and the three accent colors used across the site.</p>
      </div>
      <label className="admin-field">
        Name
        <input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
      </label>
      <label className="admin-field">
        Tagline
        <input value={settings.tagline} onChange={(event) => setSettings({ ...settings, tagline: event.target.value })} />
      </label>
      {colors.map((color) => (
        <label className="admin-field" key={color.key}>
          {color.label}
          <input
            type="color"
            value={settings[color.key]}
            onChange={(event) => setSettings({ ...settings, [color.key]: event.target.value })}
          />
        </label>
      ))}
      {error ? <p className="admin-error">{error}</p> : null}
      {status ? <p className="admin-ok">{status}</p> : null}
      <button className="admin-btn primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
