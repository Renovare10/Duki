// <chadm-appbar>: the shared header corner for Chad's apps — a 9-dot app tray and a
// profile avatar with an account menu. Framework-free, no build, light DOM (styled by
// chadm-appbar.css through --cab-* variables). Usage: see docs/APPBAR.md.
//
//   const bar = document.querySelector('chadm-appbar');   // <chadm-appbar app="library">
//   bar.configure({ user: { email }, canSignOut, plan, items, onSignIn, onSignUp, onSignOut });
//
// Robust by design: before configure() (or if the page's own code failed), Log in / Sign up /
// Sign out still work: they fire bubbling "chadm-signin" / "chadm-signup" / "chadm-signout" events
// and then follow the signin-href / signup-href / signout-href attributes when no handler is set.

// The ecosystem, in tray order. Add an app here and every app shows it.
export const APPS = [
  { id: 'home', name: 'Chad Murchison', url: 'https://chadmurchison.com/', color: '#5b6573',
    icon: '<path d="M5 11.5 12 5l7 6.5V19h-4.5v-4.5h-5V19H5z" fill="#fff"/>' },
  { id: 'library', name: "Alexandrea's Library", url: 'https://library.chadmurchison.com/', color: '#1b1e23',
    icon: '<path d="M4 7c2.6-1 5.3-1 8 .6V19c-2.7-1.6-5.4-1.6-8-.6z" fill="#3daee9"/><path d="M20 7c-2.6-1-5.3-1-8 .6V19c2.7-1.6 5.4-1.6 8-.6z" fill="#7cc8f0"/>' },
  { id: 'duki', name: 'Duki', url: 'https://duki.chadmurchison.com/', color: '#c4452b',
    icon: '<path fill="#f4eadc" transform="translate(1.6 1.6) scale(.65)" d="M9 7.5h11.2c2.7 0 4.6 1.5 4.6 3.9 0 1.7-1 3-2.7 3.6 2 .5 3.3 2 3.3 3.9 0 2.7-2.1 4.4-5.2 4.4H9V7.5zm3.6 6.5h6.4c1.3 0 2.1-.7 2.1-1.7s-.8-1.6-2.1-1.6h-6.4V13zm0 7.4h6.9c1.4 0 2.3-.8 2.3-1.9s-.9-1.8-2.3-1.8h-6.9v3.7z"/>' },
];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const DOTS = '<svg aria-hidden="true" viewBox="0 0 24 24">' +
  [5, 12, 19].flatMap(y => [5, 12, 19].map(x => `<circle cx="${x}" cy="${y}" r="2"/>`)).join('') + '</svg>';
const PERSON = '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6"/></svg>';
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';
let uid = 0;

class ChadmAppBar extends HTMLElement {
  #o = { apps: APPS, user: null, canSignOut: false, signInLabel: 'Log in', plan: null, items: [], onSignIn: null, onSignUp: null, onSignOut: null };
  #open = null;     // { btn, pop }

  connectedCallback() {
    if (this.id_) return;
    this.id_ = `cab${++uid}`;
    this.classList.add('cab');
    this.#safeRender();
    this.addEventListener('keydown', e => this.#key(e));
    document.addEventListener('pointerdown', e => { if (this.#open && !this.contains(e.target)) this.close(false); });
    addEventListener('hashchange', () => this.close(false));
  }
  // Options (any subset): app, apps, user {email, name?} | null, canSignOut (show Sign out while signed
  // out, e.g. stale sign-in state), signInLabel (e.g. "Continue as a@b.c"), plan async () => {text, fraction?, badge?, action?},
  // items [{label, onSelect | href | (type:'checkbox', checked, onChange)}] or () => items, onSignIn, onSignUp, onSignOut.
  configure(opts) { Object.assign(this.#o, opts); if (this.id_) this.#safeRender(); }
  #safeRender() {
    try { this.#render(); } catch (e) {
      console.error('chadm-appbar', e);
      this.#o.user = null;            // fall back to a plain signed-out menu that still works
      try { this.#render(); } catch { /* leave the previous markup */ }
    }
  }
  // Run a sign-in / sign-up / sign-out action: the configured hook, else the event's listeners,
  // else the *-href attribute. Errors are reported, never swallowed silently.
  #act(hook, name) {
    const ev = new CustomEvent(`chadm-${name}`, { bubbles: true, cancelable: true });
    if (!this.dispatchEvent(ev)) return;           // a listener handled it
    try {
      if (this.#o[hook]) return Promise.resolve(this.#o[hook]()).catch(e => console.error('chadm-appbar', name, e));
    } catch (e) { console.error('chadm-appbar', name, e); }
    const href = this.getAttribute(`${name}-href`);
    if (href) location.href = href;
  }

  #render() {
    const { user } = this.#o, id = this.id_;
    const initial = (user?.name || user?.email || '?').trim()[0]?.toUpperCase() || '?';
    this.innerHTML = `
      <button type="button" class="cab-btn cab-apps-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}-apps"
        aria-label="Apps" title="Apps">${DOTS}</button>
      <button type="button" class="cab-avatar${user ? '' : ' out'}" aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}-me"
        aria-label="${user ? `Account: ${esc(user.email)}` : 'Account (not signed in)'}" title="${user ? esc(user.email) : 'Not signed in'}">
        ${user ? `<span aria-hidden="true">${esc(initial)}</span>` : PERSON}</button>
      <div class="cab-pop cab-tray" id="${id}-apps" role="dialog" aria-label="Apps" hidden></div>
      <div class="cab-pop cab-menu" id="${id}-me" role="dialog" aria-label="Account" hidden></div>`;
    const [appsBtn, meBtn] = this.querySelectorAll('button');
    appsBtn.onclick = () => this.#toggle(appsBtn, () => this.#tray());
    meBtn.onclick = () => this.#toggle(meBtn, () => this.#menu());
  }
  #tray() {
    const pop = this.querySelector('.cab-tray'), app = this.getAttribute('app') || this.#o.app;
    pop.innerHTML = `<ul class="cab-grid">${this.#o.apps.map(a => `<li><a class="cab-app" href="${esc(a.url)}"
      ${a.id === app ? 'aria-current="page"' : ''}><span class="cab-ic" style="background:${esc(a.color)}" aria-hidden="true">
      <svg viewBox="0 0 24 24">${a.icon}</svg></span><span class="cab-name">${esc(a.name)}</span></a></li>`).join('')}</ul>`;
    return pop;
  }
  #menu() {
    const o = this.#o, pop = this.querySelector('.cab-menu');
    let items = [];
    try { items = (typeof o.items === 'function' ? o.items() : o.items) || []; } catch (e) { console.error('chadm-appbar items', e); }
    pop.innerHTML = o.user
      ? `<div class="cab-head"><span class="cab-avatar big" aria-hidden="true">${esc((o.user.name || o.user.email || '?')[0].toUpperCase())}</span>
          <div><div class="cab-who">Signed in as</div><div class="cab-email">${esc(o.user.email)}</div></div></div>
         ${o.plan ? '<div class="cab-plan" aria-live="polite"><span class="cab-note">Loading storage…</span></div>' : ''}`
      : `<div class="cab-head"><span class="cab-avatar big out" aria-hidden="true">${PERSON}</span>
          <div class="cab-who">You're not signed in</div></div>
         <div class="cab-row"><button type="button" class="cab-b cab-in">${esc(o.signInLabel || 'Log in')}</button>
           <button type="button" class="cab-b primary cab-up">Sign up</button></div>`;
    const list = document.createElement('div');
    list.className = 'cab-items';
    for (const it of items) { try { list.append(this.#item(it)); } catch (e) { console.error('chadm-appbar item', e); } }
    if (o.user || o.canSignOut) {
      const out = this.#item({ label: 'Sign out', onSelect: () => this.#act('onSignOut', 'signout') });
      out.classList.add('cab-out'); list.append(out);
    }
    pop.append(list);
    pop.querySelector('.cab-in')?.addEventListener('click', () => { this.close(); this.#act('onSignIn', 'signin'); });
    pop.querySelector('.cab-up')?.addEventListener('click', () => { this.close(); this.#act('onSignUp', 'signup'); });
    if (o.user && o.plan) this.#plan(pop.querySelector('.cab-plan'));
    return pop;
  }
  async #plan(el) {
    try {
      const p = await this.#o.plan();
      if (!p) { el.remove(); return; }
      const pct = p.fraction != null ? Math.round(Math.min(1, p.fraction) * 100) : null;
      el.innerHTML = `${pct != null ? `<div class="cab-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"
        aria-label="Storage used"><i style="width:${pct}%"></i></div>` : ''}
        <span>${esc(p.text)}</span>${p.badge ? ` <span class="cab-badge">${esc(p.badge)}</span>` : ''}`;
      if (p.action) {
        const b = this.#item(p.action); b.classList.add('cab-plan-act'); el.append(b);
      }
    } catch (e) { el.innerHTML = `<span class="cab-note">${esc(e.message)}</span>`; }
  }
  #item(it) {
    if (it.type === 'checkbox') {
      const l = document.createElement('label');
      l.className = 'cab-item cab-check';
      l.innerHTML = `<input type="checkbox"> <span>${esc(it.label)}</span>`;
      const box = l.querySelector('input');
      Promise.resolve().then(() => typeof it.checked === 'function' ? it.checked() : it.checked).then(v => { box.checked = !!v; }, () => {});
      box.onchange = () => it.onChange?.(box.checked);
      return l;
    }
    const el = document.createElement(it.href ? 'a' : 'button');
    el.className = 'cab-item';
    el.textContent = it.label;
    if (it.href) el.href = it.href;
    else el.type = 'button';
    el.addEventListener('click', () => { this.close(false); it.onSelect?.(); });
    return el;
  }

  #toggle(btn, build) {
    const was = this.#open?.btn === btn;
    this.close(false);
    if (was) return;
    const pop = build();
    pop.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    this.#open = { btn, pop };
    (pop.querySelector('[aria-current]') || pop.querySelector(FOCUSABLE))?.focus();
  }
  close(focus = true) {
    if (!this.#open) return;
    const { btn, pop } = this.#open;
    this.#open = null;
    pop.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (focus) btn.focus();
  }
  // Escape closes; Tab stays inside the open popover; arrow keys move between its items.
  #key(e) {
    if (!this.#open) return;
    const els = [...this.#open.pop.querySelectorAll(FOCUSABLE)];
    const i = els.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); return; }
    const step = { Tab: e.shiftKey ? -1 : 1, ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step || !els.length) return;
    if (!this.#open.pop.contains(document.activeElement) && e.key !== 'Tab') return;
    e.preventDefault();
    els[(i + step + els.length) % els.length].focus();
  }
}
if (!customElements.get('chadm-appbar')) customElements.define('chadm-appbar', ChadmAppBar);
