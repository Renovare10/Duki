import type { FormEvent } from "react";

type Props = {
  paste: string;
  title: string;
  error: string | null;
  onPasteChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onAdd: (event: FormEvent) => void;
  onCancel: () => void;
};

export function AddText({
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
          Paste Chinese you have the right to read. It lives on this device, on
          the Your uploads shelf.
        </p>
      </section>
      <form className="paste-card" onSubmit={onAdd}>
        <h2>Paste Chinese</h2>
        <textarea
          value={paste}
          onChange={(e) => onPasteChange(e.target.value)}
          placeholder="把中文贴在这里…"
          aria-label="Chinese text to read"
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
