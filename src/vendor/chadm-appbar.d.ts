// Types for the shared <chadm-appbar> (copied from Alexandrea's Library; see its docs/APPBAR.md).
export type ChadmApp = { id: string; name: string; url: string; color: string; icon: string };
export type ChadmAppBarItem =
  | { label: string; onSelect: () => void }
  | { label: string; href: string }
  | { type: "checkbox"; label: string; checked: boolean | (() => boolean | Promise<boolean>); onChange: (on: boolean) => void };
export type ChadmAppBarOptions = {
  app?: string;
  apps?: ChadmApp[];
  user?: { email: string; name?: string } | null;
  canSignOut?: boolean;
  signInLabel?: string;
  plan?: null | (() => Promise<{ text: string; fraction?: number; badge?: string } | null>);
  items?: ChadmAppBarItem[] | (() => ChadmAppBarItem[]);
  onSignIn?: (() => void) | null;
  onSignUp?: (() => void) | null;
  onSignOut?: (() => void) | null;
};
export interface ChadmAppBarElement extends HTMLElement {
  configure(opts: ChadmAppBarOptions): void;
  close(focus?: boolean): void;
}
export const APPS: ChadmApp[];
