import { expect, it } from "vitest";
import { segment } from "./segment";
import { remainingUniques, scoreTokens } from "./score";

it("scores capitalized English occurrences under the same lowercase word record", () => {
  const tokens = segment("Cat, cat! CAT. Dog dog.", () => false, 8, "en");
  const statuses = new Map([["cat", "known"], ["dog", "shaky"]] as const);
  expect(scoreTokens(tokens, statuses)).toMatchObject({ total: 5, known: 3, shaky: 2, unique: 2 });
  expect(remainingUniques(tokens, statuses)).toEqual({ uniqueUnknown: 0, uniqueShaky: 1 });
});
