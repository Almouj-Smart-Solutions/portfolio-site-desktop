"use client";

import { FormEvent, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { adminJson } from "@/lib/admin-fetch";

type Theory = { label: string; color: string };

const fonts = ["Fira Sans", "Times New Roman", "Georgia", "Arial", "system-ui"];
const sizes = ["12px", "14px", "16px", "18px", "24px"];
const swatches = ["#1a1a1a", "#F43454", "#FB7A04", "#83E01B"];

export default function AboutAdminPage() {
  const [htmlMode, setHtmlMode] = useState(false);
  const [html, setHtml] = useState("");
  const [theories, setTheories] = useState<Theory[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://");
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyleKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: "",
    onUpdate: ({ editor: current }) => {
      setHtml(current.getHTML());
    },
  });

  useEffect(() => {
    let cancelled = false;
    adminJson<{ bioHtml: string; theories: Theory[] }>("/api/admin/about")
      .then((data) => {
        if (cancelled) return;
        setHtml(data.bioHtml || "");
        setTheories(data.theories.map((theory) => ({ label: theory.label, color: theory.color })));
        editor?.commands.setContent(data.bioHtml || "");
        setReady(true);
      })
      .catch((reason: Error) => setError(reason.message));
    return () => {
      cancelled = true;
    };
  }, [editor]);

  function run(action: () => void) {
    if (!editor) return;
    action();
  }

  function openLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(previous || "https://");
    setLinkOpen(true);
    setImageOpen(false);
  }

  function openImage() {
    if (!editor) return;
    const previous = editor.getAttributes("image").src as string | undefined;
    setImageUrl(previous || "https://");
    setImageOpen(true);
    setLinkOpen(false);
  }

  function placeImage(url: string) {
    if (!editor || !url) return;
    if (editor.isActive("image")) {
      editor.chain().focus().updateAttributes("image", { src: url }).run();
    } else {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setImageOpen(false);
  }

  function applyImage() {
    placeImage(imageUrl.trim());
  }

  async function uploadImage(file: File | undefined) {
    if (!file || !editor) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/admin/about/images", { method: "POST", body });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }
      setImageUrl(payload.url);
      placeImage(payload.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    if (!editor || !editor.isActive("image")) {
      setImageOpen(false);
      return;
    }
    editor.chain().focus().deleteSelection().run();
    setImageOpen(false);
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!url) {
      chain.unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive("link")) {
      chain
        .insertContent({
          type: "text",
          text: url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    } else {
      chain.setLink({ href: url }).run();
    }
    setLinkOpen(false);
  }

  function removeLink() {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  }

  function toggleHtml() {
    if (!editor) return;
    if (htmlMode) {
      editor.commands.setContent(html);
      setHtmlMode(false);
      return;
    }
    setHtml(editor.getHTML());
    setHtmlMode(true);
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setStatus("");
    const bioHtml = htmlMode ? html : editor?.getHTML() ?? html;
    try {
      await adminJson("/api/admin/about", "PUT", { bioHtml, theories });
      setStatus("Saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const preview = htmlMode ? html : editor?.getHTML() ?? html;

  return (
    <form className="admin-stack" onSubmit={onSave}>
      <div>
        <h1 className="admin-title">About</h1>
        <p className="admin-lead">Edit the biography. Colors, italics, and underlines are stored as HTML.</p>
      </div>

      <div className="admin-row">
        <button className="admin-btn" type="button" onClick={() => run(() => editor!.chain().focus().toggleBold().run())}>Bold</button>
        <button className="admin-btn" type="button" onClick={() => run(() => editor!.chain().focus().toggleItalic().run())}>Italic</button>
        <button className="admin-btn" type="button" onClick={() => run(() => editor!.chain().focus().toggleUnderline().run())}>Underline</button>
        <button className="admin-btn" type="button" onClick={() => run(() => editor!.chain().focus().toggleStrike().run())}>Strike</button>
        <select
          aria-label="Font family"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value;
            if (value) run(() => editor!.chain().focus().setFontFamily(value).run());
            event.target.value = "";
          }}
        >
          <option value="">Font</option>
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        <select
          aria-label="Font size"
          defaultValue=""
          onChange={(event) => {
            const value = event.target.value;
            if (value) run(() => editor!.chain().focus().setFontSize(value).run());
            event.target.value = "";
          }}
        >
          <option value="">Size</option>
          {sizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        {swatches.map((color) => (
          <button
            key={color}
            className="admin-btn"
            type="button"
            style={{ background: color, color: color === "#83E01B" ? "#111" : "#fff" }}
            onClick={() => run(() => editor!.chain().focus().setColor(color).run())}
          >
            Color
          </button>
        ))}
        <label className="admin-btn">
          Custom
          <input
            type="color"
            aria-label="Custom text color"
            style={{ marginLeft: 8, width: 28, height: 18, padding: 0, border: 0, background: "transparent" }}
            onChange={(event) => run(() => editor!.chain().focus().setColor(event.target.value).run())}
          />
        </label>
        <button
          className={`admin-btn${editor?.isActive("link") || linkOpen ? " active" : ""}`}
          type="button"
          onClick={openLink}
        >
          Link
        </button>
        <button
          className={`admin-btn${editor?.isActive("image") || imageOpen ? " active" : ""}`}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={openImage}
        >
          Image
        </button>
        <button className="admin-btn" type="button" onClick={() => run(() => editor!.chain().focus().unsetAllMarks().clearNodes().run())}>
          Clear
        </button>
        <button className={`admin-btn${htmlMode ? " active" : ""}`} type="button" onClick={toggleHtml}>
          {htmlMode ? "Rich text" : "HTML"}
        </button>
      </div>

      {linkOpen ? (
        <div className="link-bar">
          <label className="admin-field link-url">
            Link URL
            <input
              type="url"
              value={linkUrl}
              placeholder="https://"
              autoFocus
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
            />
          </label>
          <button className="admin-btn primary" type="button" onClick={applyLink}>
            Apply
          </button>
          <button className="admin-btn" type="button" onClick={removeLink}>
            Remove
          </button>
          <button className="admin-btn" type="button" onClick={() => setLinkOpen(false)}>
            Cancel
          </button>
        </div>
      ) : null}

      {imageOpen ? (
        <div className="link-bar">
          <label className="admin-field link-url">
            Image URL
            <input
              type="url"
              value={imageUrl}
              placeholder="https://"
              autoFocus
              onChange={(event) => setImageUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyImage();
                }
              }}
            />
          </label>
          <button
            className="admin-btn primary"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={applyImage}
          >
            Insert
          </button>
          <label className="admin-btn">
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void uploadImage(file);
              }}
            />
          </label>
          <button
            className="admin-btn"
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={removeImage}
          >
            Remove
          </button>
          <button className="admin-btn" type="button" onClick={() => setImageOpen(false)}>
            Cancel
          </button>
        </div>
      ) : null}

      <div className="admin-split">
        <div className="admin-editor">
          {htmlMode ? (
            <textarea className="admin-html" value={html} onChange={(event) => setHtml(event.target.value)} />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
        <div>
          <p className="admin-muted">Preview</p>
          <div className="admin-preview" dangerouslySetInnerHTML={{ __html: ready ? preview : "" }} />
        </div>
      </div>

      <section className="admin-stack">
        <h2>Theories</h2>
        {theories.map((theory, index) => (
          <div className="admin-row" key={index}>
            <label className="admin-field" style={{ flex: 1 }}>
              Label
              <input
                value={theory.label}
                onChange={(event) => {
                  const next = [...theories];
                  next[index] = { ...theory, label: event.target.value };
                  setTheories(next);
                }}
              />
            </label>
            <label className="admin-field">
              Color
              <select
                value={theory.color}
                onChange={(event) => {
                  const next = [...theories];
                  next[index] = { ...theory, color: event.target.value };
                  setTheories(next);
                }}
              >
                <option value="pink">pink</option>
                <option value="orange">orange</option>
                <option value="green">green</option>
              </select>
            </label>
            <button
              className="admin-btn danger"
              type="button"
              onClick={() => setTheories(theories.filter((_, itemIndex) => itemIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button className="admin-btn" type="button" onClick={() => setTheories([...theories, { label: "", color: "pink" }])}>
          Add theory
        </button>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}
      {status ? <p className="admin-ok">{status}</p> : null}
      <button className="admin-btn primary" type="submit" disabled={saving || !ready}>
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
