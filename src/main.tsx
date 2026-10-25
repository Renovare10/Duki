import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { migrateAuthStorage } from "./lib/auth";
import { answerPullRequest, captureHandoff } from "./lib/handoff";
import "./vendor/chadm-appbar.css";
import "./index.css";

migrateAuthStorage(); // before anything reads the stored sign-in
// #sso=…: a one-time sign-in handoff from the library. Read and cleared before App routes on the hash.
captureHandoff();

function render() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

// ?sso_for=library: the library asks for a handoff code. Answer and leave without rendering.
void answerPullRequest()
  .then((url) => (url ? window.location.replace(url) : render()))
  .catch(() => render());
