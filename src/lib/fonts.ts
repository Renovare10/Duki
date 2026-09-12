import type { ReaderSettings } from "../types";

export const FONT_STACKS: Record<ReaderSettings["fontFamily"], string> = {
  serif: `"Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif`,
  sans: `"Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`,
  system: `ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif`,
};

export const FONT_LABELS: Record<ReaderSettings["fontFamily"], string> = {
  serif: "Serif",
  sans: "Sans",
  system: "System",
};
