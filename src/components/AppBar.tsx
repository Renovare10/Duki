import { useEffect, useRef } from "react";
import "../vendor/chadm-appbar.js";
import type { ChadmAppBarElement, ChadmAppBarItem } from "../vendor/chadm-appbar.js";

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
  items: ChadmAppBarItem[];
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
};

/** The shared chadmurchison.com app tray + profile corner (same element as the library's). */
export function AppBar({ email, signedIn, canSignOut, items, onSignIn, onSignUp, onSignOut }: Props) {
  const ref = useRef<ChadmAppBarElement>(null);
  useEffect(() => {
    try {
      ref.current?.configure({
        user: signedIn ? { email: email ?? "Signed in" } : null,
        canSignOut,
        items,
        onSignIn,
        onSignUp,
        onSignOut,
      });
    } catch (err) {
      console.error("app bar", err);
    }
  });
  return <chadm-appbar app="duki" ref={ref} />;
}
