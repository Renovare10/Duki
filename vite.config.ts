/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const root = path.dirname(fileURLToPath(import.meta.url));

/** App still imports ./data/catalog; serve the merged library (base + ladder) instead. */
function catalogToLibrary() {
  return {
    name: "duki-catalog-to-library",
    enforce: "pre" as const,
    resolveId(source: string, importer?: string) {
      if (source !== "./data/catalog" || !importer) return null;
      if (!importer.replace(/\\/g, "/").endsWith("/src/App.tsx")) return null;
      return path.resolve(root, "src/data/library.ts");
    },
  };
}

export default defineConfig({
  plugins: [catalogToLibrary(), react()],
  server: { port: 5173, strictPort: true },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
