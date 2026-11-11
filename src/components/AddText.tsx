import type { FormEvent } from "react";
import type { Language } from "../types";

type Props = {
  lang?: Language;
  paste: string;
  title: string;
  error: string | null;
  onPasteChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onAdd: (event: FormEvent) => void;
  onCancel: () => void;
};

export function AddText({
  lang = "zh",
  paste,
  title,
  error,
  onPasteChange,
  onTitleChange,
  onAdd,
  onCancel,
}: Props) {
  return (
    <div className="shell">
      <section className="hero">
        <h1>Add your own</h1>
        <p>
          {lang === "en"
            ? "Paste English you have the right to read, or use Import for a UTF-8 .txt file. Text only; no images, PDFs, documents, audio or embedded binary/base64. Stories live on this device on Yours."
            : "Paste Chinese you have the right to read, or use Import for a UTF-8 .txt file. Text only; no images, PDFs, documents, audio or embedded binary/base64. Stories live on this device on Your uploads; verified accounts also sync pasted text."}
        </p>
      </section>
      <form className="paste-card" onSubmit={onAdd}>
        <h2>{lang === "en" ? "Paste English" : "Paste Chinese"}</h2>
        <textarea
          value={paste}
          onChange={(e) => onPasteChange(e.target.value)}
          placeholder={lang === "en" ? "Paste English here…" : "把中文贴在这里…"}
          aria-label={lang === "en" ? "English text to read" : "Chinese text to read"}
        />
        <div className="paste-row">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title (optional)"
            aria-label="Title"
          />
          <button className="primary" type="submit">
            Add to library
          </button>
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
        {error ? <p className="paste-error">{error}</p> : null}
      </form>
    </div>
  );
}
