/**
 * Senses removed from specific words when the glossary is built.
 * 黄 / 黄色 mean "yellow" in ordinary texts; the slang
 * "pornographic / vulgar / lewd" sense is dropped so a rebuild cannot
 * bring it back. Words whose only meaning is that slang (黄片, 黄书)
 * are left as they are.
 */
export const DROP_SENSES = {
  黄: /porn|obscen|lewd|vulgar|erotic|sexual/i,
  黄色: /porn|obscen|lewd|vulgar|erotic|sexual/i,
};

export function keepSenses(hanzi, parts) {
  const drop = DROP_SENSES[hanzi];
  if (!drop) return parts;
  return parts.flatMap((p) => String(p).split(/;\s*/)).filter((p) => p && !drop.test(p));
}
