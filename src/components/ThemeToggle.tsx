import type { ReaderTheme } from "../types";

type Props = {
  theme: ReaderTheme;
  onChange: (theme: ReaderTheme) => void;
  className?: string;
};

export function ThemeToggle({ theme, onChange, className = "text-btn" }: Props) {
  const night = theme === "night";
  return (
    <button
      type="button"
      className={className}
      aria-pressed={night}
      aria-label={night ? "Switch to paper theme" : "Switch to night theme"}
      onClick={() => onChange(night ? "paper" : "night")}
    >
      {night ? "Paper" : "Night"}
    </button>
  );
}
