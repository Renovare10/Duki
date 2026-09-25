export const HOME_TITLE = "Duki — Mandarin reading";

export function documentTitle(page: string | null | undefined): string {
  const name = page?.replace(/\s+/g, " ").trim();
  if (!name) return HOME_TITLE;
  return `${name} — Duki`;
}

export const THEME_COLORS = {
  paper: "#f4eadc",
  night: "#16120e",
} as const;

export function themeColor(theme: string | undefined): string {
  return theme === "night" ? THEME_COLORS.night : THEME_COLORS.paper;
}
