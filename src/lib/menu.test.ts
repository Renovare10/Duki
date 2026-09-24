import { describe, expect, it } from "vitest";
import { MENU_GROUPS, type MenuActionId, type MenuGroupId } from "./menu";

function group(id: MenuGroupId) {
  const found = MENU_GROUPS.find((g) => g.id === id);
  if (!found) throw new Error(`missing group ${id}`);
  return found;
}

describe("MENU_GROUPS", () => {
  it("lists group ids in order", () => {
    expect(MENU_GROUPS.map((g) => g.id)).toEqual(["read", "look", "account", "backup"]);
  });

  it("uses the Read / Look / Account / Backup labels", () => {
    expect(MENU_GROUPS.map((g) => g.label)).toEqual(["Read", "Look", "Account", "Backup"]);
  });

  it("has unique action ids", () => {
    const ids = MENU_GROUPS.flatMap((g) => [...g.actions]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts Review, Stats, and Add text in Read", () => {
    expect(group("read").actions).toEqual(["review", "stats", "add"]);
  });

  it("puts only the theme action in Look", () => {
    expect(group("look").actions).toEqual(["theme"]);
  });

  it("puts only the auth action in Account", () => {
    expect(group("account").actions).toEqual(["auth"]);
  });

  it("puts Export and Import in Backup", () => {
    expect(group("backup").actions).toEqual(["export", "import"]);
  });

  it("covers every action id once", () => {
    const ids = MENU_GROUPS.flatMap((g) => [...g.actions]) as MenuActionId[];
    expect(ids.sort()).toEqual(
      ["add", "auth", "export", "import", "review", "stats", "theme"].sort(),
    );
  });
});
