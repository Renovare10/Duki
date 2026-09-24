export type MenuGroupId = "read" | "look" | "account" | "backup";

export type MenuActionId =
  | "review"
  | "stats"
  | "add"
  | "theme"
  | "auth"
  | "export"
  | "import";

export type MenuGroup = {
  id: MenuGroupId;
  label: string;
  actions: readonly MenuActionId[];
};

export const MENU_GROUPS: readonly MenuGroup[] = [
  { id: "read", label: "Read", actions: ["review", "stats", "add"] },
  { id: "look", label: "Look", actions: ["theme"] },
  { id: "account", label: "Account", actions: ["auth"] },
  { id: "backup", label: "Backup", actions: ["export", "import"] },
];

export const MENU_ACTION_LABELS: Record<Exclude<MenuActionId, "theme" | "auth">, string> = {
  review: "Review",
  stats: "Stats",
  add: "Add text",
  export: "Export",
  import: "Import",
};
