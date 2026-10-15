import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AddText } from "./components/AddText";
import { Home } from "./components/Home";
import { Reader } from "./components/Reader";
import { Review } from "./components/Review";
import { Stats } from "./components/Stats";
import { ThemeToggle } from "./components/ThemeToggle";
import { CATALOG } from "./data/catalog";
import { findBook } from "./lib/books";
import { documentTitle } from "./lib/page";
import {
  accountThemeKey,
  applyDocumentTheme,
  BOOT_THEME,
  legacyDeviceTheme,
  readThemeCache,
  rememberAccountTheme,
  rememberDeviceTheme,
  resolveTheme,
  writeThemeCache,
} from "./lib/theme";
import { parseShareHash, type ShareKind } from "./lib/share";
import { BookScreen } from "./components/Book";
import { WorkScreen } from "./components/Work";
import { findWork } from "./data/works";
import { personalReady } from "./lib/library";
import type { VocabProfile } from "./lib/difficulty";
import {
  isWorkRowId,
  loadChapter,
  loadToc,
  neighbors,
  parseWorkRowId,
  workChapterRow,
  workRowId,
  type WorkToc,
} from "./lib/works";
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
  subjectFromIdToken,
  type AuthTokens,
  authorizeUrl,
  shouldTrySilentSignIn,
  authTimeFromIdToken,
  sessionStart,
  SILENT_SIGNIN_KEY,
  signupUrl,
  AuthExpiredError,
  hasStoredAuthKey,
} from "./lib/auth";
import { AppBar } from "./components/AppBar";
import { markSignedIn, markSignedOut, sharedSession, signedOutSince, ssoAlive } from "./vendor/chadm-session.js";
import {
  applySyncState,
  deleteText,
  importBackup,
  DEFAULT_SETTINGS,
  loadAll,
  loadSettings,
  parseBackup,
  putSession,
  putEvent,
  putSettings,
  putText,
  putWord,
} from "./lib/db";
import { makeWordEvent } from "./lib/history";
import { mergeSnapshots, packSnapshot, pullSnapshot, pushSnapshot } from "./lib/sync";
import { dukiApiBase } from "./lib/gutenberg";
import { hasWord, loadGlossary, MAX_WORD_LEN } from "./lib/glossary";
import { loadClassic, type ClassicBody } from "./lib/classics";
import { loadScriptChoice, saveScriptChoice, type ScriptChoice } from "./lib/script";
import { profilesFrom, type WordSetFile } from "./lib/word-sets";
import { MENU_ACTION_LABELS, MENU_GROUPS, type MenuActionId } from "./lib/menu";
import { remainingUniques, scoreCounts, scoreTokens } from "./lib/score";
import { segment } from "./lib/segment";
import { applyReadingTap, applyReviewGrade } from "./lib/word";
import type {
  BackupFile,
  Bookmark,
  LibraryText,
  ReaderSettings,
  ReaderTheme,
  ReadingSession,
  ReviewGrade,
  TextScore,
  WordEvent,
  WordRecord,
  WordStatus,
} from "./types";

type View =
  | { name: "home"; shelf?: string }
  | { name: "add" }
  | { name: "reader"; id: string }
  | { name: "book"; id: string }
  | { name: "work"; id: string }
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
  if (view.name === "work") return `#/work/${encodeURIComponent(view.id)}`;
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
  if (path.startsWith("/work/")) {
    return { name: "work", id: decodeURIComponent(path.slice("/work/".length)) };
  }
  if (path === "/stats" || path.startsWith("/stats?")) return { name: "stats" };
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
  const [wordEvents, setWordEvents] = useState<WordEvent[]>([]);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [paste, setPaste] = useState("");
  const [title, setTitle] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [wikiErrors, setWikiErrors] = useState<Record<string, string>>({});
  const [wikiLoading, setWikiLoading] = useState<string | null>(null);
  const [classicPair, setClassicPair] = useState<ClassicBody | null>(null);
  const [scriptChoice, setScriptChoice] = useState<ScriptChoice>(() => loadScriptChoice());
  const [profileTick, setProfileTick] = useState(0);
  const profilesRef = useRef<Map<string, VocabProfile> | null>(null);
  const [shareTextId, setShareTextId] = useState<string | null>(null);
  const [shareMissing, setShareMissing] = useState(false);
  /** Chapter bodies of long works, fetched on open; never persisted. */
  const [workBodies, setWorkBodies] = useState<Map<string, string>>(new Map());
  const workBodiesRef = useRef(workBodies);
  workBodiesRef.current = workBodies;
  const [workTocs, setWorkTocs] = useState<Map<string, WorkToc>>(new Map());
  const [workError, setWorkError] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthTokens | null>(() => loadStoredAuth());
  /** A `?code=` sign-in exchange is in flight, so we don't know who this is yet. */
  const [authPending, setAuthPending] = useState(
    () =>
      parseAuthCallback(window.location.search, window.location.hash) !== null &&
      Boolean(window.sessionStorage.getItem(PKCE_VERIFIER_KEY)),
  );
  /** IndexedDB settings have been read (fast path, ahead of the glossary). */
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const settingsLoadedRef = useRef(false);
  /** The signed-in account's snapshot has been pulled (or that failed / timed out). */
  const [accountSettled, setAccountSettled] = useState(false);
  const [themeCache, setThemeCache] = useState(() => readThemeCache());
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
  const importInputRef = useRef<HTMLInputElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  function navigate(next: View) {
    setMenuOpen(false);
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
      if (!mq.matches) setMenuOpen(false);
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


  const accountKey = auth
    ? accountThemeKey(subjectFromIdToken(auth.idToken), auth.email ?? null)
    : null;
  const resolvedTheme = resolveTheme({
    authPending,
    signedIn: Boolean(auth),
    deviceTheme: themeCache.device,
    deviceMigrated: themeCache.migrated,
    accountTheme: accountKey ? themeCache.accounts[accountKey] ?? null : null,
    settings: settingsLoaded ? settings : null,
    accountSettled,
  });
  /** What's on screen: night (the boot theme) until the preference is known. */
  const displayTheme = resolvedTheme ?? BOOT_THEME;

  useEffect(() => {
    if (resolvedTheme) applyDocumentTheme(resolvedTheme, { fade: true });
  }, [resolvedTheme]);

  // Fast settings read so the theme doesn't wait on the glossary download.
  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then((loaded) => {
        if (!cancelled && !settingsLoadedRef.current) setSettings(loaded);
      })
      .catch(() => {
        /* fall back to defaults */
      })
      .finally(() => {
        if (cancelled) return;
        settingsLoadedRef.current = true;
        setSettingsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Signed in: no API configured → nothing to wait for; otherwise don't hold
  // the boot theme forever if the pull is slow.
  useEffect(() => {
    if (!auth || accountSettled) return;
    if (!dukiApiBase()) {
      setAccountSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setAccountSettled(true), 6000);
    return () => window.clearTimeout(timer);
  }, [auth, accountSettled]);

  // Remember the account's synced theme for an instant, flicker-free next load.
  useEffect(() => {
    if (!accountKey || !accountSettled || !settingsLoaded) return;
    if (themeCache.accounts[accountKey] === settings.theme) return;
    setThemeCache(rememberAccountTheme(accountKey, settings.theme));
  }, [accountKey, accountSettled, settingsLoaded, settings.theme, themeCache]);

  // One-time: a guest who picked night before this device cache existed keeps it.
  useEffect(() => {
    if (auth || authPending || !settingsLoaded || themeCache.migrated) return;
    const legacy = legacyDeviceTheme(settings);
    setThemeCache(
      writeThemeCache((c) => ({
        ...c,
        device: c.device ?? (legacy === "night" ? "night" : null),
        migrated: true,
      })),
    );
  }, [auth, authPending, settingsLoaded, settings, themeCache.migrated]);

  useEffect(() => {
    let page = "";
    if (view.name === "reader") page = texts.find((item) => item.id === view.id)?.title ?? "";
    else if (view.name === "book") {
      page = texts.find((item) => item.seriesId === view.id)?.seriesTitle ?? "";
    } else if (view.name === "work") page = findWork(view.id)?.title ?? "";
    else if (view.name === "review") page = "Review";
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
    if (!verifier) {
      setAuthPending(false);
      return;
    }
    void exchangeAuthCode(parsed.code, verifier, window.location.origin)
      .then((signedIn) => {
        const tokens = { ...signedIn, signedInAt: Date.now() };
        storeAuth(tokens);
        markShared(tokens);
        setAccountSettled(false);
        setAuth(tokens);
        window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
      })
      .catch(() => {
        /* stay a guest */
      })
      .finally(() => setAuthPending(false));
  }, []);

  // Shared chadmurchison.com session (docs/SSO.md): refresh the cookies while signed in here, and
  // end this session if someone signed out in another app since it started.
  function markShared(tokens: AuthTokens) {
    markSignedIn({ email: tokens.email, authTime: authTimeFromIdToken(tokens.idToken) });
  }
  const [shared, setShared] = useState(() => sharedSession());
  useEffect(() => {
    function sync() {
      const stored = loadStoredAuth();
      if (stored && signedOutSince(sessionStart(stored))) signOutLocal(false);
      else if (stored) markShared(stored);
      setShared(sharedSession());
    }
    sync();
    function onVisible() {
      if (!document.hidden) sync();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  const [continueDismissed, setContinueDismissed] = useState(
    () => window.sessionStorage.getItem("duki.sso.dismissed") === "1",
  );

  // Signed in on another chadmurchison.com app but not here yet: while Cognito's session is alive,
  // one silent redirect signs in with no password; otherwise the "Continue as" prompt offers one tap.
  useEffect(() => {
    let lastTriedAt: number | null = Number(window.sessionStorage.getItem(SILENT_SIGNIN_KEY)) || null;
    const s = sharedSession();
    if (
      !shouldTrySilentSignIn({
        signedIn: Boolean(loadStoredAuth()),
        callbackInUrl: parseAuthCallback(window.location.search, window.location.hash) !== null,
        hint: s.signedIn,
        online: navigator.onLine,
        lastTriedAt,
        ssoAlive: ssoAlive(s),
      })
    )
      return;
    lastTriedAt = Date.now();
    window.sessionStorage.setItem(SILENT_SIGNIN_KEY, String(lastTriedAt));
    void onSignIn();
  }, []);

  async function onSignIn(signup = false) {
    const pkce = await createPkce();
    window.sessionStorage.setItem(PKCE_VERIFIER_KEY, pkce.verifier);
    const url = signup ? signupUrl : authorizeUrl;
    window.location.assign(url(window.location.origin, pkce.challenge, sharedSession().email));
  }

  /** Sign out. Always works: local state is cleared first, then the hosted UI session ends. */
  function onSignOut() {
    signOutLocal(true);
    window.sessionStorage.setItem(SILENT_SIGNIN_KEY, String(Date.now()));
    window.location.assign(logoutUrl(window.location.origin));
  }

  /** Forget the tokens here and the shared hint. everywhere: a real Sign out (the other apps follow). */
  function signOutLocal(everywhere: boolean) {
    try {
      markSignedOut({ everywhere });
      clearAuth();
    } catch {
      /* storage blocked */
    }
    authRef.current = null;
    setAuth(null);
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
        markShared(tokens);
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
      setAccountSettled(true);
      await pushSnapshot(tokens.idToken, next);
    } catch (err) {
      // Refused refresh: cleanly signed out (no half signed-in state). Offline: stay as is.
      if (err instanceof AuthExpiredError) signOutLocal(false);
      setAccountSettled(true);
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
        setWordEvents(loaded.events);
        setSettings(loaded.settings);
        settingsLoadedRef.current = true;
        setSettingsLoaded(true);
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

  useEffect(() => {
    let cancel = false;
    fetch("/meta/word-sets.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WordSetFile | null) => {
        if (cancel || !data?.vocab || !data.texts) return;
        profilesRef.current = profilesFrom(data);
        setProfileTick((n) => n + 1);
      })
      .catch(() => {
        /* cards stay unscored until a fetch */
      });
    return () => {
      cancel = true;
    };
  }, []);

  const statuses = useMemo(() => {
    const map = new Map<string, WordStatus>();
    for (const [hanzi, rec] of words) map.set(hanzi, rec.status);
    return map;
  }, [words]);

  const scores = useMemo(() => {
    const map = new Map<string, TextScore>();
    const profiles = profilesRef.current;
    for (const text of texts) {
      if (text.body.trim()) {
        map.set(text.id, scoreTokens(segment(text.body, hasWord, MAX_WORD_LEN), statuses));
      } else {
        const profile = profiles?.get(text.id);
        map.set(
          text.id,
          profile ? scoreCounts(profile.words, profile.counts, statuses) : scoreTokens([], statuses),
        );
      }
    }
    return map;
  }, [texts, statuses, profileTick]);

  const currentRow =
    view.name === "reader"
      ? texts.find((t) => t.id === view.id)
      : view.name === "share" && shareTextId
        ? texts.find((t) => t.id === shareTextId)
        : undefined;
  const readingWork = view.name === "reader" ? parseWorkRowId(view.id) : null;
  // Work chapters: the stored row has no body; attach the fetched one for reading.
  const current =
    currentRow && isWorkRowId(currentRow.id)
      ? workBodies.has(currentRow.id)
        ? { ...currentRow, body: workBodies.get(currentRow.id)! }
        : undefined
      : currentRow;
  const personal = useMemo(() => personalReady(statuses), [statuses]);

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
      } else if (text.wsTitle || text.kind === "wikisource") {
        const classic = await loadClassic(text.id);
        if (classic) {
          setClassicPair(classic);
          if (text.body.trim()) return text;
          next = {
            ...text,
            body: classic.simplified,
            source: text.source || "From Wikisource (public domain / CC BY-SA)",
            sourceUrl: text.sourceUrl || classic.url,
            preview: false,
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
    if (isWorkRowId(id)) {
      navigate({ name: "reader", id });
      return;
    }
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

  // Opening a work chapter: fetch its body (and the work's contents for
  // prev/next), then save/refresh the progress row with openedAt.
  useEffect(() => {
    if (!ready || view.name !== "reader") return;
    const ref = parseWorkRowId(view.id);
    const id = view.id;
    if (!ref) {
      const text = textsRef.current.find((t) => t.id === id);
      if (text && (text.kind === "wikisource" || text.wsTitle)) {
        void openClassic(text);
      } else {
        setClassicPair(null);
        if (text) void saveText({ ...text, openedAt: Date.now() });
      }
      return;
    }
    const work = findWork(ref.workId);
    if (!work) {
      setWorkError("That book isn’t in this version of Duki.");
      return;
    }
    let cancelled = false;
    setWorkError(null);
    (async () => {
      try {
        const [toc, chapter] = await Promise.all([loadToc(ref.workId), loadChapter(ref.workId, ref.key)]);
        if (cancelled) return;
        setWorkTocs((prev) => (prev.has(ref.workId) ? prev : new Map(prev).set(ref.workId, toc)));
        setWorkBodies((prev) => new Map(prev).set(id, chapter.body));
        const existing = textsRef.current.find((t) => t.id === id);
        await saveText(workChapterRow(work, chapter, existing, Date.now()));
        // Warm the next chapter so "next" opens instantly.
        const next = neighbors(toc, ref.key).next;
        if (next) void loadChapter(ref.workId, next.key).catch(() => {});
      } catch (err) {
        if (!cancelled) setWorkError(err instanceof Error ? err.message : "Could not load this chapter.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, view]);

  /** Stats history: local-only, best effort — a failed write never blocks reading or review. */
  function logWordEvent(event: WordEvent) {
    setWordEvents((prev) => [...prev, event]);
    void putEvent(event).catch(() => {
      /* history is optional */
    });
  }

  async function setStatus(hanzi: string, status: WordStatus) {
    const prev = wordsRef.current.get(hanzi);
    const next = applyReadingTap(prev, hanzi, status);
    setWords((p) => new Map(p).set(hanzi, next));
    logWordEvent(makeWordEvent(prev, next, "read"));
    await putWord(next);
    scheduleCloudPush();
  }

  async function onGrade(hanzi: string, grade: ReviewGrade) {
    const existing = wordsRef.current.get(hanzi);
    const prev = existing ?? applyReadingTap(undefined, hanzi, "unknown");
    const next = applyReviewGrade(prev, grade);
    setWords((p) => new Map(p).set(hanzi, next));
    logWordEvent(makeWordEvent(existing, next, "review", grade));
    await putWord(next);
    scheduleCloudPush();
  }

  async function openClassic(text: LibraryText) {
    const classic = await loadClassic(text.id);
    const current = textsRef.current.find((t) => t.id === text.id) ?? text;
    if (classic) setClassicPair(classic);
    else setClassicPair(null);
    if (!current.body.trim() && classic) {
      await saveText({
        ...current,
        body: classic.simplified,
        sourceUrl: current.sourceUrl || classic.url,
        openedAt: Date.now(),
      });
      return;
    }
    if (!current.body.trim()) {
      await fillRemote(current.id, "read");
      return;
    }
    await saveText({ ...current, openedAt: Date.now() });
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

  async function onDone(id: string, durationMs: number, then?: string) {
    const text = textsRef.current.find((t) => t.id === id);
    if (!text) return;
    const next = { ...text, readAt: text.readAt ?? Date.now() };
    await saveText(next);
    const body = isWorkRowId(id) ? workBodiesRef.current.get(id) ?? "" : text.body;
    const tokens = segment(body, hasWord, MAX_WORD_LEN);
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
    const work = parseWorkRowId(id);
    if (work) {
      if (then) navigate({ name: "reader", id: workRowId(work.workId, then) });
      else navigate({ name: "work", id: work.workId });
    } else if (text.seriesId) navigate({ name: "book", id: text.seriesId });
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

  /**
   * Toggle. Signed in: saved to the account's synced settings (stamped so the
   * newest choice wins a merge) and to the local per-account cache. Signed out:
   * this device only, so it never rewrites an account's preference.
   */
  function onThemeChange(theme: ReaderTheme) {
    if (auth) {
      if (accountKey) setThemeCache(rememberAccountTheme(accountKey, theme));
      void onSettings({ ...settingsRef.current, theme, themeSetAt: Date.now() });
    } else {
      setThemeCache(rememberDeviceTheme(theme));
    }
  }

  /** Reader shows the on-screen theme; its font changes keep the stored theme. */
  function onReaderSettings(next: ReaderSettings) {
    if (next.theme !== displayTheme) {
      onThemeChange(next.theme);
      return;
    }
    const stored = settingsRef.current;
    void onSettings({ ...next, theme: stored.theme, themeSetAt: stored.themeSetAt });
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

  /** Prev / contents / done-and-next under a work chapter. */
  function chapterFooter(workId: string, key: string, elapsed: () => number) {
    const toc = workTocs.get(workId);
    const nav = toc ? neighbors(toc, key) : null;
    const id = workRowId(workId, key);
    return (
      <nav className="chapter-nav" aria-label="Chapters">
        {nav?.prev ? (
          <button type="button" className="ghost" onClick={() => navigate({ name: "reader", id: workRowId(workId, nav.prev!.key) })}>
            ← {nav.prev.label}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="ghost" onClick={() => navigate({ name: "work", id: workId })}>
          Contents
        </button>
        {nav?.next ? (
          <button type="button" className="primary" onClick={() => void onDone(id, elapsed(), nav.next!.key)}>
            Done · next: {nav.next.label} →
          </button>
        ) : (
          <button type="button" className="primary" onClick={() => void onDone(id, elapsed())}>
            Done · finished
          </button>
        )}
      </nav>
    );
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
            theme={displayTheme}
            onChange={onThemeChange}
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
          <span key={id} className="auth-chip menu-action-auth">
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                closeMenu();
                void onSignIn();
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                closeMenu();
                void onSignIn(true);
              }}
            >
              Sign up
            </button>
          </span>
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
      <header className={`topbar${menuOpen ? " menu-open" : ""}`} ref={topbarRef}>
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
        </nav>
        <AppBar
          email={auth?.email ?? null}
          signedIn={Boolean(auth)}
          canSignOut={Boolean(auth) || hasStoredAuthKey() || shared.signedIn}
          signInLabel={!auth && shared.signedIn && shared.email ? `Continue as ${shared.email}` : "Log in"}
          items={[
            { label: MENU_ACTION_LABELS.review, onSelect: () => navigate({ name: "review" }) },
            { label: MENU_ACTION_LABELS.stats, onSelect: () => navigate({ name: "stats" }) },
            { label: MENU_ACTION_LABELS.add, onSelect: () => navigate({ name: "add" }) },
            {
              type: "checkbox",
              label: "Night theme",
              checked: displayTheme === "night",
              onChange: (on) => onThemeChange(on ? "night" : "paper"),
            },
            { label: MENU_ACTION_LABELS.export, onSelect: () => onExport() },
            { label: MENU_ACTION_LABELS.import, onSelect: () => importInputRef.current?.click() },
          ]}
          onSignIn={() => void onSignIn()}
          onSignUp={() => void onSignIn(true)}
          onSignOut={onSignOut}
        />
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void onImport(file);
          }}
        />
      </header>

      {!auth && !authPending && shared.signedIn && !continueDismissed ? (
        <div className="sso-continue" role="region" aria-label="Signed in on chadmurchison.com">
          <p>
            You're signed in on chadmurchison.com{shared.email ? ` as ${shared.email}` : ""}.
          </p>
          <button type="button" className="primary" onClick={() => void onSignIn()}>
            {shared.email ? `Continue as ${shared.email}` : "Continue"}
          </button>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              window.sessionStorage.setItem("duki.sso.dismissed", "1");
              setContinueDismissed(true);
            }}
          >
            Not now
          </button>
        </div>
      ) : null}

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
          statuses={statuses}
          sessions={sessions}
          openShelf={view.shelf ?? null}
          wikiErrors={wikiErrors}
          wikiLoading={wikiLoading}
          onOpenShelf={(id) => navigate(id ? { name: "home", shelf: id } : { name: "home" })}
          onOpen={(id) => void onOpen(id)}
          onOpenBook={(seriesId) => navigate({ name: "book", id: seriesId })}
          onOpenWork={(workId) => navigate({ name: "work", id: workId })}
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
            personal={personal}
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

      {ready && view.name === "work" ? (
        findWork(view.id) ? (
          <WorkScreen
            work={findWork(view.id)!}
            texts={texts}
            statuses={statuses}
            personal={personal}
            onBack={() => navigate({ name: "home" })}
            onOpenChapter={(key) => navigate({ name: "reader", id: workRowId(view.id, key) })}
          />
        ) : (
          <div className="shell">
            <p>That book isn’t in the library.</p>
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
          settings={{ ...settings, theme: displayTheme }}
          onSetStatus={(hanzi, status) => void setStatus(hanzi, status)}
          onBookmark={(bookmark) => void onBookmark(current.id, bookmark)}
          onDone={(durationMs) => void onDone(current.id, durationMs)}
          onSettings={onReaderSettings}
          classic={classicPair && current.id === classicPair.id ? classicPair : null}
          script={scriptChoice}
          onScript={(next) => {
            setScriptChoice(next);
            saveScriptChoice(next);
          }}
          footer={readingWork ? (elapsed) => chapterFooter(readingWork.workId, readingWork.key, elapsed) : undefined}
        />
      ) : null}

      {ready && readingWork && !current ? (
        <div className="shell">
          {workError ? <p className="wiki-error">{workError}</p> : <p>Opening the chapter…</p>}
          <button
            className="primary"
            type="button"
            onClick={() => navigate(findWork(readingWork.workId) ? { name: "work", id: readingWork.workId } : { name: "home" })}
          >
            {findWork(readingWork.workId) ? "Back to contents" : "Back to the shelves"}
          </button>
        </div>
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

      {ready && view.name === "reader" && !current && !readingWork ? (
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
          events={wordEvents}
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
