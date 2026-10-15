import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { migrateAuthStorage } from "./lib/auth";
import "./vendor/chadm-appbar.css";
import "./index.css";

migrateAuthStorage(); // before anything reads the stored sign-in

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
