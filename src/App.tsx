import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AddText } from "./components/AddText";
import { Home } from "./components/Home";
import { Reader } from "./components/Reader";
import { Review } from "./components/Review";
import { Stats } from "./components/Stats";
import { ThemeToggle } from "./components/ThemeToggle";
import { CATALOG } from "./data/catalog";
import { findBook } from "./lib/books";
import { documentTitle, themeColor } from "./lib/page";
import { parseShareHash, type ShareKind } from "./lib/share";
import { BookScreen } from "./components/Book";
import { fetchWikiPage, randomWikipedia, searchWikipedia, wikiStub, wikiTextId } from "./lib/wiki";
import { fetchWikisourcePage, searchWikisource, wsTextId, wikisourceStubs } from "./lib/wikisource";
import {
  clearAuth,
  createPkce,
  ensureFreshAuth,
  exchangeAuthCode,
  loadStoredAuth,
  logoutUrl,
  parseAuthCallback,
  PKCE_VERIFIER_KEY,
  storeAuth,
  stripAuthQuery,
  type AuthTokens,
  authorizeUrl,
} from "./lib/auth";
import {
  applySyncState,
  deleteText,
  importBackup,
  DEFAULT_SETTINGS,
  loadAll,
  parseBackup,
  putSession,
  putSettings,
  putText,
  putWord,
} from "./lib/db";
import { mergeSnapshots, packSnapshot, pullSnapshot, pushSnapshot } from "./lib/sync";
import { hasWord, loadGlossary, MAX_WORD_LEN } from "./lib/glossary";
import { MENU_ACTION_LABELS, MENU_GROUPS, type MenuActionId } from "./lib/menu";
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
  | { name: "book"; id: string }
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
  if (view.name === "book") return `#/book/${encodeURIComponent(view.id)}`;
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
  if (path.startsWith("/book/")) {
    return { name: "book", id: decodeURIComponent(path.slice("/book/".length)) };
  }
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
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [paste, setPaste] = useState("");
  const [title, setTitle] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [wikiErrors, setWikiErrors] = useState<Record<string, string>>({});
  const [wikiLoading, setWikiLoading] = useState<string | null>(null);
  const [shareTextId, setShareTextId] = useState<string | null>(null);
  const [shareMissing, setShareMissing] = useState(false);
  const [auth, setAuth] = useState<AuthTokens | null>(() => loadStoredAuth());
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const textsRef = useRef(texts);
  textsRef.current = texts;
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const authRef = useRef(auth);
  authRef.current = auth;
  const syncingRef = useRef(false);
  const syncTimerRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountSlotRef = useRef<HTMLDivElement>(null);
  const accountFaceRef = useRef<HTMLButtonElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    setAccountOpen(false);
  }

  function navigate(next: View) {
    setMenuOpen(false);
    setAccountOpen(false);
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
    const mq = window.matchMedia("(max-width: 720px)");
    function onViewport() {
      if (!mq.matches) {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    }
    mq.addEventListener("change", onViewport);
    return () => mq.removeEventListener("change", onViewport);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      const node = event.target;
      if (!(node instanceof Node)) return;
      if (topbarRef.current?.contains(node)) return;
      setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuToggleRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: PointerEvent) {
      const node = event.target;
      if (!(node instanceof Node)) return;
      if (accountSlotRef.current?.contains(node)) return;
      setAccountOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setAccountOpen(false);
      accountFaceRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  useEffect(() => {
    const theme = settings.theme === "night" ? "night" : "paper";
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor(theme));
  }, [settings.theme]);

  useEffect(() => {
    let page = "";
    if (view.name === "reader") page = texts.find((item) => item.id === view.id)?.title ?? "";
    else if (view.name === "book") {
      page = texts.find((item) => item.seriesId === view.id)?.seriesTitle ?? "";
    } else if (view.name === "review") page = "Review";
    else if (view.name === "stats") page = "Stats";
    else if (view.name === "add") page = "Add text";
    document.title = documentTitle(page);
  }, [view, texts]);

  useEffect(() => {
    const parsed = parseAuthCallback(window.location.search, window.location.hash);
    if (!parsed) return;
    window.history.replaceState(
      null,
      "",
      stripAuthQuery(window.location.pathname, window.location.hash),
    );
    const verifier = window.sessionStorage.getItem(PKCE_VERIFIER_KEY);
    if (!verifier) return;
    void exchangeAuthCode(parsed.code, verifier, window.location.origin)
      .then((tokens) => {
        storeAuth(tokens);
        setAuth(tokens);
        window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      })
      .catch(() => {
        /* stay a guest */
      });
  }, []);

  async function onSignIn() {
    const pkce = await createPkce();
    window.sessionStorage.setItem(PKCE_VERIFIER_KEY, pkce.verifier);
    window.location.assign(authorizeUrl(window.location.origin, pkce.challenge));
  }

  function onSignOut() {
    clearAuth();
    setAuth(null);
    window.location.assign(logoutUrl(window.location.origin));
  }

  function localSnapshot() {
    return packSnapshot({
      words: [...wordsRef.current.values()],
      texts: textsRef.current,
      sessions: sessionsRef.current,
      settings: settingsRef.current,
    });
  }

  async function runCloudSync() {
    const stored = authRef.current;
    if (!stored?.idToken || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const tokens = await ensureFreshAuth(stored);
      if (tokens !== stored) {
        storeAuth(tokens);
        authRef.current = tokens;
        setAuth(tokens);
      }
      let next = localSnapshot();
      const remote = await pullSnapshot(tokens.idToken);
      if (remote) {
        next = mergeSnapshots(next, remote);
        await applySyncState(next);
        const loaded = await loadAll();
        const sorted = loaded.texts.sort(
          (a, b) => a.createdAt - b.createdAt || a.title.localeCompare(b.title),
        );
        textsRef.current = sorted;
        setTexts(sorted);
        setWords(new Map(loaded.words.map((w) => [w.hanzi, w])));
        setSessions(loaded.sessions);
        setSettings(loaded.settings);
        next = packSnapshot({
          words: loaded.words,
          texts: sorted,
          sessions: loaded.sessions,
          settings: loaded.settings,
        });
      }
      await pushSnapshot(tokens.idToken, next);
    } catch {
      /* stay on this browser */
    } finally {
      syncingRef.current = false;
    }
  }

  function scheduleCloudPush() {
    if (!authRef.current?.idToken) return;
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      void runCloudSync();
    }, 1500);
  }

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

  useEffect(() => {
    if (!ready || !auth) return;
    void runCloudSync();
  }, [ready, auth]);

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
    ]);
    for (const batch of batches) {
      if (batch.status === "fulfilled") mergeIncoming(batch.value);
    }
  }

  async function fillRemote(id: string, mode: "score" | "read"): Promise<LibraryText | null> {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return null;
    if (text.gutenbergId || text.kind === "gutenberg") {
      setWikiErrors((prev) => ({ ...prev, [id]: "This text isn’t available in the library." }));
      return null;
    }
    const needsFetch =
      !text.body.trim() ||
      (mode === "read" && text.preview && Boolean(text.wikiTitle));
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
    scheduleCloudPush();
  }

  async function onGrade(hanzi: string, grade: ReviewGrade) {
    const prev = wordsRef.current.get(hanzi) ?? applyReadingTap(undefined, hanzi, "unknown");
    const next = applyReviewGrade(prev, grade);
    setWords((p) => new Map(p).set(hanzi, next));
    await putWord(next);
    scheduleCloudPush();
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
    scheduleCloudPush();
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
      return null;
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
    scheduleCloudPush();
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
    scheduleCloudPush();
    if (text.seriesId) navigate({ name: "book", id: text.seriesId });
    else navigate({ name: "home" });
  }

  async function onMarkRead(id: string, read: boolean) {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return;
    await saveText({ ...text, readAt: read ? text.readAt ?? Date.now() : null });
  }

  async function onSettings(next: ReaderSettings) {
    setSettings(next);
    await putSettings(next);
    scheduleCloudPush();
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
    scheduleCloudPush();
    navigate({ name: "reader", id: item.id });
  }

  async function onDelete(id: string) {
    const target = texts.find((t) => t.id === id);
    if (!target || target.kind !== "paste") return;
    if (!window.confirm(`Remove “${target.title}” from your library?`)) return;
    await deleteText(id);
    textsRef.current = textsRef.current.filter((t) => t.id !== id);
    setTexts(textsRef.current);
    scheduleCloudPush();
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
      scheduleCloudPush();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not import that file.");
    }
  }

  function renderMenuAction(id: MenuActionId) {
    switch (id) {
      case "theme":
        return (
          <ThemeToggle
            key={id}
            className="text-btn menu-action-theme"
            theme={settings.theme}
            onChange={(theme) => void onSettings({ ...settings, theme })}
          />
        );
      case "review":
        return (
          <button
            key={id}
            type="button"
            className={`text-btn menu-action-review${view.name === "review" ? " current" : ""}`}
            onClick={() => {
              closeMenu();
              navigate({ name: "review" });
            }}
          >
            {MENU_ACTION_LABELS.review}
          </button>
        );
      case "stats":
        return (
          <button
            key={id}
            type="button"
            className={`text-btn menu-action-stats${view.name === "stats" ? " current" : ""}`}
            onClick={() => {
              closeMenu();
              navigate({ name: "stats" });
            }}
          >
            {MENU_ACTION_LABELS.stats}
          </button>
        );
      case "add":
        return (
          <button
            key={id}
            type="button"
            className={`text-btn menu-action-add${view.name === "add" ? " current" : ""}`}
            onClick={() => {
              closeMenu();
              navigate({ name: "add" });
            }}
          >
            {MENU_ACTION_LABELS.add}
          </button>
        );
      case "export":
        return (
          <button
            key={id}
            type="button"
            className="text-btn menu-action-export"
            onClick={() => {
              closeMenu();
              onExport();
            }}
          >
            {MENU_ACTION_LABELS.export}
          </button>
        );
      case "auth":
        return auth ? (
          <span key={id} className="auth-chip menu-action-auth">
            {auth.email ? (
              <span className="auth-email" title={auth.email}>
                {auth.email}
              </span>
            ) : null}
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                closeMenu();
                onSignOut();
              }}
            >
              Sign out
            </button>
          </span>
        ) : (
          <button
            key={id}
            type="button"
            className="text-btn menu-action-auth"
            onClick={() => {
              closeMenu();
              void onSignIn();
            }}
          >
            Sign in
          </button>
        );
      case "import":
        return (
          <label
            key={id}
            className="file-btn menu-action-import"
            onClick={() => closeMenu()}
          >
            {MENU_ACTION_LABELS.import}
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
        );
    }
  }

  return (
    <div className="app">
      <header className={`topbar${menuOpen ? " menu-open" : ""}${accountOpen ? " account-open" : ""}`} ref={topbarRef}>
        <button
          type="button"
          className="brand"
          onClick={() => {
            closeMenu();
            navigate({ name: "home" });
          }}
        >
          <span className="seal" aria-hidden="true">
            读
          </span>
          <span>
            <span className="brand-name">Duki</span>
            <span className="brand-sub">A library of stories</span>
          </span>
        </button>
        <button
          type="button"
          className="text-btn menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="app-menu"
          ref={menuToggleRef}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav id="app-menu" className="top-actions" aria-label="Main">
          {MENU_GROUPS.filter((group) => group.id === "read" || group.id === "look").map((group) => (
            <div key={group.id} className={`menu-group menu-group-${group.id}`} data-group={group.id}>
              <p className="menu-group-label">{group.label}</p>
              {group.actions.map((actionId) => renderMenuAction(actionId))}
            </div>
          ))}
          <div className="account-slot" ref={accountSlotRef}>
            <button
              type="button"
              className="account-face"
              aria-expanded={accountOpen}
              aria-controls="account-panel"
              aria-label={auth?.email ? `Account, ${auth.email}` : "Account"}
              ref={accountFaceRef}
              onClick={() => setAccountOpen((open) => !open)}
            >
              <svg className="account-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M5.6 19.2c1.15-3.05 3.35-4.5 6.4-4.5s5.25 1.45 6.4 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <span className="account-face-word">Account</span>
            </button>
            <div className="account-panel" id="account-panel">
              {MENU_GROUPS.filter((group) => group.id === "account" || group.id === "backup").map(
                (group) => (
                  <div
                    key={group.id}
                    className={`menu-group menu-group-${group.id}`}
                    data-group={group.id}
                  >
                    <p className="menu-group-label">{group.label}</p>
                    {group.actions.map((actionId) => renderMenuAction(actionId))}
                  </div>
                ),
              )}
            </div>
          </div>
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
          onOpenBook={(seriesId) => navigate({ name: "book", id: seriesId })}
          onScore={(id) => void onScoreCard(id)}
          onDelete={(id) => void onDelete(id)}
          onMarkRead={(id, readFlag) => void onMarkRead(id, readFlag)}
          onAddText={() => navigate({ name: "add" })}
          onRemoteSearch={(q) => void onRemoteSearch(q)}
        />
      ) : null}

      {ready && view.name === "book" ? (
        findBook(texts, view.id) ? (
          <BookScreen
            book={findBook(texts, view.id)!}
            scores={scores}
            wikiErrors={wikiErrors}
            wikiLoading={wikiLoading}
            onBack={() => navigate({ name: "home" })}
            onOpenChapter={(id) => void onOpen(id)}
            onScore={(id) => void onScoreCard(id)}
            onMarkRead={(id, readFlag) => void onMarkRead(id, readFlag)}
          />
        ) : (
          <div className="shell">
            <p>That book is gone.</p>
            <button className="primary" type="button" onClick={() => navigate({ name: "home" })}>
              Back to the shelves
            </button>
          </div>
        )
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
          {shareMissing || (view.name === "share" && view.kind === "gutenberg") ? (
            <p>{view.name === "share" && view.kind === "gutenberg" ? "This text isn’t available." : "That text is gone."}</p>
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
