export type CardSurface =
  | "cover"
  | "title"
  | "blurb"
  | "unscored"
  | "score"
  | "read"
  | "mark"
  | "remove";

export type CardHitAction = "open" | "score" | "mark" | "delete";

/** Cover/title/blurb open the reader. Unscored badge and Score stay on Home. */
export function cardHitAction(surface: CardSurface): CardHitAction {
  if (surface === "unscored" || surface === "score") return "score";
  if (surface === "mark") return "mark";
  if (surface === "remove") return "delete";
  return "open";
}
