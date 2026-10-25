import { useEffect, useRef } from "react";
import "../vendor/chadm-appbar.js";
import type { ChadmApp, ChadmAppBarElement, ChadmAppBarItem } from "../vendor/chadm-appbar.js";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "chadm-appbar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { app?: string };
    }
  }
}

type Props = {
  email: string | null;
  signedIn: boolean;
  /** Anything sign-in related is stored here (tokens or the shared hint): offer Sign out. */
  canSignOut: boolean;
  /** "Log in", or "Continue as <email>" when signed in on another chadmurchison.com app. */
  signInLabel: string;
  items: ChadmAppBarItem[];
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
  /** URL to open for a tray app (one-time sign-in handoff); null = the plain link. */
  openApp?: (app: ChadmApp) => Promise<string | null>;
};

/** The shared chadmurchison.com app tray + profile corner (same element as the library's). */
export function AppBar({ email, signedIn, canSignOut, signInLabel, items, onSignIn, onSignUp, onSignOut, openApp }: Props) {
  const ref = useRef<ChadmAppBarElement>(null);
  useEffect(() => {
    try {
      ref.current?.configure({
        user: signedIn ? { email: email ?? "Signed in" } : null,
        canSignOut,
        signInLabel,
        items,
        onSignIn,
        onSignUp,
        onSignOut,
        openApp: openApp ?? null,
      });
    } catch (err) {
      console.error("app bar", err);
    }
  });
  return <chadm-appbar app="duki" ref={ref} />;
}
