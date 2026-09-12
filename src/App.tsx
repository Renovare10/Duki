import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AddText } from "./components/AddText";
import { Home } from "./components/Home";
import { Reader } from "./components/Reader";
import { Review } from "./components/Review";
import { Stats } from "./components/Stats";
import { CATALOG } from "./data/catalog";
import { fetchGutenbergText, fetchGutendexList, gutenbergIdOf, PREVIEW_CHARS } from "./lib/gutenberg";
import { parseShareHash, type ShareKind } from "./lib/share";
import { fetchWikiPage, randomWikipedia, searchWikipedia, wikiStub, wikiTextId } from "./lib/wiki";
import { fetchWikisourcePage, searchWikisource, wsTextId, wikisourceStubs } from "./lib/wikisource";
import {
  deleteText,
  importBackup,
  loadAll,
  parseBackup,
  putSession,
  putSettings,
  putText,
  putWord,
} from "./lib/db";
import { hasWord, loadGlossary, MAX_WORD_LEN } from "./lib/glossary";
import { remainingUniques, scoreTokens } from "./lib/score";
import { segment } from "./lib/segment";
import { applyReadingTap, applyReviewGrade } from "./lib/word";
import type {
  BackupFile,
  Bookmark,
  LibraryText,
  ReaderSettings,
  ReadingSession,
  ReviewGrade,
  TextScore,
  WordRecord,
  WordStatus,
} from "./types";

type View =
  | { name: "home"; shelf?: string }
  | { name: "add" }
  | { name: "reader"; id: string }
  | { name: "share"; kind: ShareKind; key: string }
  | { name: "review"; focus?: string }
  | { name: "stats" };

function hasHan(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

function firstLineTitle(body: string): string {
  const line = body.replace(/\s+/g, " ").trim();
  return line.slice(0, 12) || "Untitled";
}

function viewToHash(view: View): string {
  if (view.name === "home") {
    return view.shelf ? `#/shelf/${encodeURIComponent(view.shelf)}` : "#/";
  }
  if (view.name === "add") return "#/add";
  if (view.name === "stats") return "#/stats";
  if (view.name === "share") {
    return `#/r/${view.kind}/${encodeURIComponent(view.key)}`;
  }
  if (view.name === "review") {
    return view.focus ? `#/review/${encodeURIComponent(view.focus)}` : "#/review";
  }
  return `#/read/${encodeURIComponent(view.id)}`;
}

function hashToView(hash: string): View {
  const raw = hash.replace(/^#/, "") || "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path === "/" || path === "") return { name: "home" };
  if (path.startsWith("/shelf/")) {
    return { name: "home", shelf: decodeURIComponent(path.slice("/shelf/".length)) };
  }
  if (path === "/add") return { name: "add" };
  if (path === "/stats") return { name: "stats" };
  if (path === "/review") return { name: "review" };
  if (path.startsWith("/review/")) {
    return { name: "review", focus: decodeURIComponent(path.slice("/review/".length)) };
  }
  const shared = parseShareHash(hash);
  if (shared) return { name: "share", kind: shared.kind, key: shared.key };
  if (path.startsWith("/read/")) {
    return { name: "reader", id: decodeURIComponent(path.slice("/read/".length)) };
  }
  return { name: "home" };
}

export default function App() {
  const [view, setView] = useState<View>(() => hashToView(window.location.hash));
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [texts, setTexts] = useState<LibraryText[]>([]);
  const [words, setWords] = useState<Map<string, WordRecord>>(new Map());
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontFamily: "serif",
    fontSize: 28,
  });
  const [paste, setPaste] = useState("");
  const [title, setTitle] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [wikiErrors, setWikiErrors] = useState<Record<string, string>>({});
  const [wikiLoading, setWikiLoading] = useState<string | null>(null);
  const [shareTextId, setShareTextId] = useState<string | null>(null);
  const [shareMissing, setShareMissing] = useState(false);
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const textsRef = useRef(texts);
  textsRef.current = texts;

  function navigate(next: View) {
    const hash = viewToHash(next);
    if (window.location.hash !== hash) window.location.hash = hash;
    else setView(next);
  }

  useEffect(() => {
    function onHash() {
      setView(hashToView(window.location.hash));
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [, loaded] = await Promise.all([loadGlossary(), loadAll()]);
        if (cancelled) return;
        const byId = new Map(loaded.texts.map((t) => [t.id, t]));
        for (const item of CATALOG) {
          const existing = byId.get(item.id);
          if (!existing) {
            await putText(item);
            byId.set(item.id, item);
          } else if (existing.kind !== "paste") {
            const merged: LibraryText = {
              ...item,
              readAt: existing.readAt,
              bookmark: existing.bookmark,
              body:
                item.wikiTitle && existing.body.trim() ? existing.body : item.body,
              source: existing.sourceUrl ? existing.source : item.source,
              sourceUrl: existing.sourceUrl || item.sourceUrl,
            };
            await putText(merged);
            byId.set(item.id, merged);
          }
        }
        setTexts(
          [...byId.values()].sort((a, b) => a.createdAt - b.createdAt || a.title.localeCompare(b.title)),
        );
        setWords(new Map(loaded.words.map((w) => [w.hanzi, w])));
        setSessions(loaded.sessions);
        setSettings(loaded.settings);
        setReady(true);
        void hydrateRemote(byId);
      } catch (err) {
        setBootError(err instanceof Error ? err.message : "Could not open local storage.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statuses = useMemo(() => {
    const map = new Map<string, WordStatus>();
    for (const [hanzi, rec] of words) map.set(hanzi, rec.status);
    return map;
  }, [words]);

  const scores = useMemo(() => {
    const map = new Map<string, TextScore>();
    for (const text of texts) {
      const tokens = segment(text.body, hasWord, MAX_WORD_LEN);
      map.set(text.id, scoreTokens(tokens, statuses));
    }
    return map;
  }, [texts, statuses]);

  const current =
    view.name === "reader"
      ? texts.find((t) => t.id === view.id)
      : view.name === "share" && shareTextId
        ? texts.find((t) => t.id === shareTextId)
        : undefined;

  function mergeIncoming(incoming: LibraryText[]) {
    if (incoming.length === 0) return;
    const byId = new Map(textsRef.current.map((t) => [t.id, t]));
    for (const item of incoming) {
      const existing = byId.get(item.id);
      if (!existing) byId.set(item.id, item);
      else if (!existing.body.trim() && item.body.trim()) byId.set(item.id, { ...existing, ...item });
      else if (!existing.body.trim()) byId.set(item.id, { ...item, ...existing, body: existing.body });
    }
    const next = [...byId.values()].sort(
      (a, b) => a.createdAt - b.createdAt || a.title.localeCompare(b.title),
    );
    textsRef.current = next;
    setTexts(next);
  }

  async function hydrateRemote(seeded: Map<string, LibraryText>) {
    void seeded;
    try {
      const books = await fetchGutendexList();
      mergeIncoming(books);
    } catch {
      /* gutendex optional */
    }
    try {
      const extra = await randomWikipedia();
      mergeIncoming(extra);
    } catch {
      /* random wiki optional */
    }
    mergeIncoming(wikisourceStubs(800));
  }

  async function onRemoteSearch(query: string) {
    const q = query.trim();
    if (q.length < 2) return;
    const batches = await Promise.allSettled([
      searchWikipedia(q),
      searchWikisource(q),
      fetchGutendexList(q),
    ]);
    for (const batch of batches) {
      if (batch.status === "fulfilled") mergeIncoming(batch.value);
    }
  }

  async function fillRemote(id: string, mode: "score" | "read"): Promise<LibraryText | null> {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return null;
    const needsFetch =
      !text.body.trim() ||
      (mode === "read" && text.preview && Boolean(text.gutenbergId || text.wikiTitle));
    if (!needsFetch) return text;

    setWikiLoading(id);
    setWikiErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      let next = { ...text };
      if (text.wikiTitle) {
        const page = await fetchWikiPage(text.wikiTitle, { full: mode === "read" });
        next = {
          ...text,
          title: page.title,
          body: page.extract,
          source: "From Wikipedia, CC BY-SA",
          sourceUrl: page.url,
          preview: mode === "score",
        };
      } else if (text.wsTitle) {
        const page = await fetchWikisourcePage(text.wsTitle);
        next = {
          ...text,
          title: text.title || page.title,
          body: page.extract,
          source: "From Wikisource (public domain / CC BY-SA)",
          sourceUrl: page.url,
          preview: false,
        };
      } else if (text.gutenbergId) {
        const page = await fetchGutenbergText(text, {
          maxChars: mode === "score" ? PREVIEW_CHARS : undefined,
        });
        next = {
          ...text,
          body: page.body,
          source: "From Project Gutenberg (public domain)",
          sourceUrl: text.sourceUrl || page.textUrl,
          preview: mode === "score",
        };
      } else {
        return text;
      }
      await saveText(next);
      return next;
    } catch (err) {
      setWikiErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : "Could not load this text.",
      }));
      return null;
    } finally {
      setWikiLoading(null);
    }
  }

  async function onScoreCard(id: string) {
    await fillRemote(id, "score");
  }

  async function onOpen(id: string) {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return;
    if (!text.body.trim() || text.preview) {
      const loaded = await fillRemote(id, "read");
      if (!loaded) return;
    }
    navigate({ name: "reader", id });
  }

  useEffect(() => {
    if (!ready || view.name !== "share") {
      if (view.name !== "share") {
        setShareTextId(null);
        setShareMissing(false);
      }
      return;
    }
    const kind = view.kind;
    const key = view.key;
    let cancelled = false;
    (async () => {
      const text = await ensureSharedText(kind, key);
      if (cancelled) return;
      if (!text) {
        setShareTextId(null);
        setShareMissing(true);
        return;
      }
      setShareMissing(false);
      setShareTextId(text.id);
      if (!text.body.trim() || text.preview) {
        await fillRemote(text.id, "read");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, view]);

  async function setStatus(hanzi: string, status: WordStatus) {
    const next = applyReadingTap(wordsRef.current.get(hanzi), hanzi, status);
    setWords((prev) => new Map(prev).set(hanzi, next));
    await putWord(next);
  }

  async function onGrade(hanzi: string, grade: ReviewGrade) {
    const prev = wordsRef.current.get(hanzi) ?? applyReadingTap(undefined, hanzi, "unknown");
    const next = applyReviewGrade(prev, grade);
    setWords((p) => new Map(p).set(hanzi, next));
    await putWord(next);
  }

  async function saveText(next: LibraryText) {
    const exists = textsRef.current.some((t) => t.id === next.id);
    textsRef.current = exists
      ? textsRef.current.map((t) => (t.id === next.id ? next : t))
      : [...textsRef.current, next].sort(
          (a, b) => a.createdAt - b.createdAt || a.title.localeCompare(b.title),
        );
    setTexts(textsRef.current);
    await putText(next);
  }

  async function ensureSharedText(kind: ShareKind, key: string): Promise<LibraryText | null> {
    if (kind === "local") {
      return textsRef.current.find((t) => t.id === key) ?? null;
    }
    if (kind === "wiki") {
      const id = wikiTextId(key);
      const existing = textsRef.current.find((t) => t.id === id || t.wikiTitle === key);
      if (existing) return existing;
      const stub = wikiStub(key, Date.now());
      await saveText(stub);
      return stub;
    }
    if (kind === "gutenberg") {
      const num = Number(key);
      if (!Number.isFinite(num) || num <= 0) return null;
      const id = gutenbergIdOf(num);
      const existing = textsRef.current.find((t) => t.id === id || t.gutenbergId === num);
      if (existing) return existing;
      const stub: LibraryText = {
        id,
        title: `Gutenberg ${num}`,
        blurb: "Project Gutenberg",
        body: "",
        kind: "gutenberg",
        category: "gutenberg",
        createdAt: Date.now(),
        readAt: null,
        bookmark: null,
        gutenbergId: num,
        source: "From Project Gutenberg (public domain)",
        sourceUrl: `https://www.gutenberg.org/ebooks/${num}`,
      };
      await saveText(stub);
      return stub;
    }
    if (kind === "wikisource") {
      const id = wsTextId(key);
      const existing = textsRef.current.find((t) => t.id === id || t.wsTitle === key);
      if (existing) return existing;
      const stub: LibraryText = {
        id,
        title: key,
        blurb: "Wikisource",
        body: "",
        kind: "wikisource",
        category: "wikisource",
        createdAt: Date.now(),
        readAt: null,
        bookmark: null,
        wsTitle: key,
        source: "From Wikisource (public domain / CC BY-SA)",
        sourceUrl: `https://zh.wikisource.org/wiki/${encodeURIComponent(key)}`,
      };
      await saveText(stub);
      return stub;
    }
    return null;
  }

  async function onBookmark(id: string, bookmark: Bookmark) {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return;
    const next = { ...text, bookmark };
    textsRef.current = textsRef.current.map((t) => (t.id === id ? next : t));
    setTexts(textsRef.current);
    await putText(next);
  }

  async function onDone(id: string, durationMs: number) {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return;
    const next = { ...text, readAt: text.readAt ?? Date.now() };
    await saveText(next);
    const tokens = segment(text.body, hasWord, MAX_WORD_LEN);
    const remaining = remainingUniques(tokens, statusesFrom(wordsRef.current));
    const session: ReadingSession = {
      id: crypto.randomUUID(),
      textId: id,
      finishedAt: Date.now(),
      uniqueUnknown: remaining.uniqueUnknown,
      uniqueShaky: remaining.uniqueShaky,
      durationMs,
    };
    setSessions((prev) => [...prev, session]);
    await putSession(session);
    navigate({ name: "home" });
  }

  async function onMarkRead(id: string, read: boolean) {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return;
    await saveText({ ...text, readAt: read ? text.readAt ?? Date.now() : null });
  }

  async function onSettings(next: ReaderSettings) {
    setSettings(next);
    await putSettings(next);
  }

  async function onAdd(event: FormEvent) {
    event.preventDefault();
    const body = paste.trim();
    if (!hasHan(body)) {
      setPasteError("Paste some Chinese first.");
      return;
    }
    const item: LibraryText = {
      id: crypto.randomUUID(),
      title: title.trim() || firstLineTitle(body),
      blurb: "Added by you.",
      body,
      kind: "paste",
      category: "paste",
      createdAt: Date.now(),
      readAt: null,
      bookmark: null,
    };
    await putText(item);
    textsRef.current = [...textsRef.current, item];
    setTexts(textsRef.current);
    setPaste("");
    setTitle("");
    setPasteError(null);
    navigate({ name: "reader", id: item.id });
  }

  async function onDelete(id: string) {
    const target = texts.find((t) => t.id === id);
    if (!target || target.kind !== "paste") return;
    if (!window.confirm(`Remove “${target.title}” from your library?`)) return;
    await deleteText(id);
    textsRef.current = textsRef.current.filter((t) => t.id !== id);
    setTexts(textsRef.current);
    if (view.name === "reader" && view.id === id) navigate({ name: "home" });
  }

  function onExport() {
    const backup: BackupFile = {
      app: "duki",
      version: 2,
      exportedAt: new Date().toISOString(),
      words: [...words.values()],
      texts,
      sessions,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const day = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `duki-${day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    setImportError(null);
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const backup = parseBackup(raw);
      const next = await importBackup(backup, CATALOG);
      setTexts(next.texts.sort((a, b) => a.createdAt - b.createdAt || a.title.localeCompare(b.title)));
      setWords(new Map(next.words.map((w) => [w.hanzi, w])));
      setSessions(next.sessions);
      setSettings(next.settings);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not import that file.");
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate({ name: "home" })}>
          <span className="seal" aria-hidden="true">
            读
          </span>
          <span>
            <span className="brand-name">Duki</span>
            <span className="brand-sub">A library of stories</span>
          </span>
        </button>
        <nav className="top-actions" aria-label="Main">
          <button
            type="button"
            className={`text-btn${view.name === "review" ? " current" : ""}`}
            onClick={() => navigate({ name: "review" })}
          >
            Review
          </button>
          <button
            type="button"
            className={`text-btn${view.name === "stats" ? " current" : ""}`}
            onClick={() => navigate({ name: "stats" })}
          >
            Stats
          </button>
          <button
            type="button"
            className={`text-btn${view.name === "add" ? " current" : ""}`}
            onClick={() => navigate({ name: "add" })}
          >
            Add text
          </button>
          <button type="button" className="text-btn" onClick={onExport}>
            Export
          </button>
          <label className="file-btn">
            Import
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void onImport(file);
              }}
            />
          </label>
        </nav>
      </header>

      {importError ? (
        <p className="paste-error" style={{ textAlign: "center", margin: "0.6rem 0 0" }}>
          {importError}
        </p>
      ) : null}

      {!ready && !bootError ? (
        <div className="splash">
          <span className="seal">读</span>
          <p>Opening the shelves…</p>
        </div>
      ) : null}

      {bootError ? (
        <div className="boot-error">
          <p>{bootError}</p>
        </div>
      ) : null}

      {ready && view.name === "home" ? (
        <Home
          texts={texts}
          scores={scores}
          sessions={sessions}
          openShelf={view.shelf ?? null}
          wikiErrors={wikiErrors}
          wikiLoading={wikiLoading}
          onOpenShelf={(id) => navigate(id ? { name: "home", shelf: id } : { name: "home" })}
          onOpen={(id) => void onOpen(id)}
          onScore={(id) => void onScoreCard(id)}
          onDelete={(id) => void onDelete(id)}
          onMarkRead={(id, readFlag) => void onMarkRead(id, readFlag)}
          onAddText={() => navigate({ name: "add" })}
          onRemoteSearch={(q) => void onRemoteSearch(q)}
        />
      ) : null}

      {ready && view.name === "add" ? (
        <AddText
          paste={paste}
          title={title}
          error={pasteError}
          onPasteChange={(value) => {
            setPaste(value);
            if (pasteError) setPasteError(null);
          }}
          onTitleChange={setTitle}
          onAdd={(event) => void onAdd(event)}
          onCancel={() => navigate({ name: "home" })}
        />
      ) : null}

      {ready && (view.name === "reader" || view.name === "share") && current?.body.trim() ? (
        <Reader
          text={current}
          words={words}
          settings={settings}
          onSetStatus={(hanzi, status) => void setStatus(hanzi, status)}
          onBookmark={(bookmark) => void onBookmark(current.id, bookmark)}
          onDone={(durationMs) => void onDone(current.id, durationMs)}
          onSettings={(next) => void onSettings(next)}
        />
      ) : null}

      {ready && view.name === "share" && !current?.body.trim() ? (
        <div className="shell">
          {shareMissing ? (
            <p>That text is gone.</p>
          ) : shareTextId && wikiErrors[shareTextId] ? (
            <p className="wiki-error">{wikiErrors[shareTextId]}</p>
          ) : (
            <p>Opening the text…</p>
          )}
          <button className="primary" type="button" onClick={() => navigate({ name: "home" })}>
            Back to the shelves
          </button>
        </div>
      ) : null}

      {ready && view.name === "reader" && !current ? (
        <div className="shell">
          <p>That text is gone.</p>
          <button className="primary" type="button" onClick={() => navigate({ name: "home" })}>
            Back to the shelves
          </button>
        </div>
      ) : null}

      {ready && view.name === "review" ? (
        <Review
          key={view.focus ?? "all"}
          words={words}
          focus={view.focus}
          onGrade={(hanzi, grade) => void onGrade(hanzi, grade)}
        />
      ) : null}

      {ready && view.name === "stats" ? (
        <Stats
          words={words}
          texts={texts}
          sessions={sessions}
          scores={scores}
          onReviewWord={(hanzi) => navigate({ name: "review", focus: hanzi })}
          onOpen={(id) => void onOpen(id)}
          onScore={(id) => void onScoreCard(id)}
          onMarkRead={(id, readFlag) => void onMarkRead(id, readFlag)}
        />
      ) : null}
    </div>
  );
}

function statusesFrom(words: Map<string, WordRecord>): Map<string, WordStatus> {
  const map = new Map<string, WordStatus>();
  for (const [hanzi, rec] of words) map.set(hanzi, rec.status);
  return map;
}
