/**
 * Nudge a graded text into the library level band by swapping near-synonyms.
 * Big misses (content words with no pair) are reported, not guessed.
 */
import { loadGlossary, loadHsk } from "./corpus.mjs";

/** Near-synonyms that can stand in for each other in ordinary prose. */
const GROUPS = [
  ["喜欢", "喜爱"],
  ["高兴", "快乐", "愉快", "开心"],
  ["漂亮", "美丽", "好看"],
  ["朋友", "友人"],
  ["今天", "今日"],
  ["明天", "明日"],
  ["昨天", "昨日"],
  ["看见", "看到", "见到"],
  ["老师", "教师"],
  ["学生", "学员"],
  ["现在", "如今", "目前"],
  ["时候", "时刻", "时辰"],
  ["东西", "物品"],
  ["孩子", "小孩", "儿童"],
  ["可以", "能够"],
  ["因为", "由于"],
  ["所以", "因此", "于是"],
  ["但是", "可是", "然而", "不过"],
  ["已经", "早已"],
  ["知道", "了解", "知晓"],
  ["觉得", "认为"],
  ["希望", "期望", "盼望"],
  ["帮助", "帮忙", "协助"],
  ["开始", "起始"],
  ["告诉", "告知"],
  ["离开", "离去"],
  ["发现", "发觉"],
  ["变成", "成为"],
  ["如果", "假如", "假若", "若是", "如若"],
  ["虽然", "尽管"],
  ["或者", "或是", "抑或"],
  ["然后", "随后", "接着"],
  ["而且", "并且"],
  ["应该", "应当"],
  ["明白", "理解", "懂得"],
  ["干净", "洁净", "整洁", "清洁"],
  ["安静", "清静", "宁静"],
  ["容易", "轻易"],
  ["困难", "艰难"],
  ["重要", "要紧"],
  ["有名", "著名", "知名", "出名"],
  ["方便", "便利", "便捷"],
  ["地方", "地点", "场所"],
  ["问题", "疑问"],
  ["以后", "之后", "日后"],
  ["以前", "之前", "从前", "先前"],
  ["晚上", "夜晚", "夜里"],
  ["早上", "早晨"],
  ["城市", "都市", "城镇"],
  ["害怕", "惧怕", "畏惧"],
  ["担心", "担忧", "忧心"],
  ["难过", "伤心", "悲伤"],
  ["生气", "气愤"],
  ["突然", "忽然", "猛然"],
  ["可能", "也许", "或许"],
  ["马上", "立刻", "立即"],
  ["经常", "常常", "时常"],
  ["一直", "始终"],
  ["还是", "仍然", "依然", "仍旧"],
  ["大约", "大概", "大致"],
  ["非常", "十分", "特别"],
  ["真的", "确实", "的确"],
  ["好像", "仿佛", "似乎", "宛如"],
  ["比较", "较为"],
  ["只是", "仅仅"],
  ["终于", "最后", "最终"],
  ["大家", "众人"],
  ["别人", "他人"],
  ["准备", "预备"],
  ["打算", "计划"],
  ["继续", "持续"],
  ["特别", "尤其", "格外"],
  ["慢慢", "渐渐", "逐渐"],
  ["后来", "随后"],
  ["刚才", "方才"],
  ["有时", "偶尔"],
  ["热闹", "喧闹"],
  ["安全", "平安"],
  ["危险", "凶险"],
  ["健康", "康健"],
  ["舒服", "舒适"],
  ["着急", "焦急"],
  ["奇怪", "古怪"],
  ["普通", "平常", "寻常"],
  ["一样", "相同"],
  ["附近", "旁边", "近处"],
  ["左边", "左侧"],
  ["右边", "右侧"],
  ["房间", "屋子"],
  ["商店", "店铺"],
  ["饭馆", "餐馆"],
  ["怎么样", "如何"],
  ["这样", "如此"],
  ["一起", "一同"],
  ["其他", "其余"],
  ["包括", "包含"],
  ["关于", "有关"],
  ["根据", "依据"],
  ["表示", "表达"],
  ["变化", "改变"],
  ["简单", "简易"],
  ["复杂", "繁杂"],
  ["清楚", "清晰"],
  ["认真", "仔细"],
  ["努力", "尽力"],
  ["注意", "留心"],
  ["照顾", "照料"],
  ["需要", "须要"],
  ["必须", "务必"],
  ["愿意", "乐意"],
  ["相信", "信赖"],
  ["感觉", "感到"],
  ["事情", "事务"],
  ["时间", "时刻"],
  ["很多", "许多"],
  ["一些", "若干"],
  ["全部", "所有", "全体"],
  ["为什么", "为何"],
  ["介绍", "说明"],
  ["休息", "歇息"],
  ["旅游", "旅行"],
  ["便宜", "低价"],
  ["快乐", "愉快"],
  ["忙", "忙碌"],
  ["快", "迅速"],
  ["慢", "缓慢"],
  ["新", "崭新"],
  ["走", "行走"],
  ["看", "瞧"],
  ["说", "讲"],
  ["多", "许多"],
  ["家里", "家中"],
  ["上午", "午前"],
  ["下午", "午后"],
  ["中午", "正午"],
  ["天气", "气候"],
  ["下雨", "降雨"],
  ["医生", "大夫"],
  ["医院", "诊所"],
  ["衣服", "衣裳"],
  ["睡觉", "睡眠"],
  ["说话", "讲话"],
  ["学习", "念书"],
  ["工作", "干活"],
  ["认识", "知晓"],
  ["现在", "此刻"],
  ["同学", "同窗"],
  ["小姐", "姑娘"],
  ["出租车", "的士"],
  ["飞机", "航班"],
  ["电脑", "计算机"],
  ["电影", "影片"],
  ["电视", "荧屏"],
  ["米饭", "白饭"],
  ["杯子", "茶杯"],
  ["桌子", "书桌"],
  ["椅子", "座椅"],
  ["猫", "小猫", "猫咪"],
  ["狗", "小狗"],
  ["脏", "肮脏", "污浊"],
  ["身体", "身躯"],
  ["学校", "学堂"],
  ["马上", "旋即"],
  ["知道", "晓得"],
  ["危险", "危殆"],
  ["道路", "路径"],
  ["脑子", "脑筋"],
  ["正好", "恰好"],
  ["工资", "薪酬", "薪水"],
  ["假话", "谎言", "谎话"],
  ["村子", "村庄"],
  ["差别", "差异"],
  ["餐厅", "食堂"],
  ["老", "苍老", "衰老"],
  ["瘦", "削瘦", "瘦削"],
  ["喉咙", "喉部"],
  ["难过", "凄楚", "哀伤"],
  ["山", "山峰"],
  ["星星", "星辰"],
  ["眼睛", "眼眸"],
  ["脸", "面庞"],
  ["听", "聆听"],
  ["跑", "奔跑"],
  ["大概", "约莫"],
  ["要是", "若是"],
  ["突然", "陡然"],
  ["后来", "嗣后"],
  ["害怕", "惶恐"],
  ["担心", "忧虑"],
  ["着急", "焦虑"],
  ["满意", "惬意"],
  ["奇怪", "怪异"],
  ["清楚", "明晰"],
  ["努力", "勉力"],
  ["帮助", "襄助"],
  ["减少", "削减"],
  ["休息", "休憩"],
  ["看见", "瞥见"],
  ["开始", "肇始"],
  ["回来", "归来"],
  ["宽大", "宽阔"],
  ["预兆", "征兆"],
  ["噪音", "噪声"],
  ["健康", "健壮"],
];

let groupIndex = null;

export function buildGroups(lookup, glossary) {
  if (groupIndex) return groupIndex;
  const map = new Map();
  for (const group of GROUPS) {
    const words = [];
    const seen = new Set();
    for (const word of group) {
      if (seen.has(word) || !glossary.hasWord(word)) continue;
      seen.add(word);
      words.push({ word, level: lookup(word) ?? 99 });
    }
    if (words.length < 2) continue;
    for (const item of words) {
      const alts = words.filter((other) => other.word !== item.word);
      const prev = map.get(item.word) || [];
      map.set(item.word, prev.concat(alts));
    }
  }
  groupIndex = map;
  return map;
}

export function measureText(app, glossary, lookup, text) {
  const tokens = app.segment(text, glossary.hasWord, glossary.maxLen).filter((t) => t.isWord);
  const words = tokens.map((t) => t.text);
  const { coverage } = app.difficulty.hskCoverage(words, lookup);
  const info = app.difficulty.levelFromCoverage(coverage);
  return {
    words,
    levels: words.map((word) => lookup(word) ?? 99),
    coverage,
    level: info.level,
    chars: app.difficulty.hanCount(text),
    missing: [...new Set(words.filter((word) => !glossary.hasWord(word)))],
    n: words.length,
  };
}

/** Unknown-share that decides the step into `target` (0–1). */
export function stepFor(measured, target) {
  if (target <= 1) return 1 - measured.coverage[0];
  if (target <= 6) return 1 - (measured.coverage[target - 2] ?? 0);
  return 1 - measured.coverage[5];
}

export function aimFor(target) {
  // minStep sits just above the 95% line so the measured level stays put.
  // maxStep stays under the validator median caps (8% at L2–L4, 12% at L5–L8).
  if (target <= 1) return { minStep: 0, maxStep: 0.05 };
  if (target <= 4) return { minStep: 0.052, maxStep: 0.078 };
  if (target <= 6) return { minStep: 0.051, maxStep: 0.11 };
  if (target === 7) return { minStep: 0.051, maxStep: 0.095 };
  if (target === 8) return { minStep: 0.102, maxStep: 0.118 };
  if (target === 9) return { minStep: 0.152, maxStep: 0.19 };
  return { minStep: 0.21, maxStep: 0.28 };
}

export function bandDistance(measured, target) {
  const aim = aimFor(target);
  const step = stepFor(measured, target);
  let distance = 0;
  if (measured.level !== target) distance += 1 + Math.abs(measured.level - target);
  if (step > aim.maxStep) distance += (step - aim.maxStep) * 20;
  if (step < aim.minStep) distance += (aim.minStep - step) * 20;
  if (target >= 2 && target <= 6) {
    const above = 1 - (measured.coverage[target - 1] ?? 0);
    if (above > 0.048) distance += (above - 0.048) * 20;
  }
  return distance;
}

export function inBand(measured, target) {
  return bandDistance(measured, target) === 0 && measured.missing.length === 0;
}

function offsets(app, glossary, text) {
  const tokens = app.segment(text, glossary.hasWord, glossary.maxLen);
  const rows = [];
  let offset = 0;
  for (const token of tokens) {
    if (token.isWord) rows.push({ offset, length: token.text.length, word: token.text });
    offset += token.text.length;
  }
  return rows;
}

function replaceAt(text, row, next) {
  return text.slice(0, row.offset) + next + text.slice(row.offset + row.length);
}

/**
 * Apply a few synonym swaps so `text` moves toward `target`.
 * Returns the new text and whether it landed in the band.
 */
function usefulSwap(from, altLevel, target, tooHard) {
  if (target >= 7) return tooHard ? from === 99 && altLevel <= 6 : from <= 6 && altLevel === 99;
  if (tooHard) return from >= target && altLevel < target;
  return from < target && altLevel === target;
}

export function fitText(app, glossary, lookup, text, target, { maxSteps = 40 } = {}) {
  const groups = buildGroups(lookup, glossary);
  let current = text;
  let steps = 0;
  for (; steps < maxSteps; steps++) {
    const measured = measureText(app, glossary, lookup, current);
    if (inBand(measured, target)) return { text: current, measured, ok: true, steps };
    const before = bandDistance(measured, target);
    const aim = aimFor(target);
    const tooHard = measured.level > target || stepFor(measured, target) > aim.maxStep;
    const rows = offsets(app, glossary, current);
    const candidates = [];
    for (let i = 0; i < rows.length; i++) {
      const alts = groups.get(rows[i].word);
      if (!alts) continue;
      const from = measured.levels[i] ?? 99;
      for (const alt of alts) {
        if (!usefulSwap(from, alt.level, target, tooHard)) continue;
        candidates.push({ index: i, alt });
      }
    }
    if (!candidates.length) break;
    const pick = [];
    const limit = 36;
    const stride = Math.max(1, Math.ceil(candidates.length / limit));
    for (let i = 0; i < candidates.length; i += stride) pick.push(candidates[i]);
    let best = null;
    for (const candidate of pick) {
      const row = rows[candidate.index];
      const trial = replaceAt(current, row, candidate.alt.word);
      const next = measureText(app, glossary, lookup, trial);
      const distance = bandDistance(next, target);
      if (distance + 1e-6 < before && (!best || distance < best.distance)) best = { text: trial, distance };
    }
    if (!best) break;
    current = best.text;
  }
  const measured = measureText(app, glossary, lookup, current);
  return { text: current, measured, ok: inBand(measured, target), steps };
}

export function failureNotes(measured, target) {
  const aim = aimFor(target);
  const step = stepFor(measured, target);
  const counts = new Map();
  measured.words.forEach((word, i) => {
    const level = measured.levels[i];
    const over = target >= 7 ? level === 99 : level > target || (step > aim.maxStep && level >= target);
    const under = target >= 7 ? level <= 6 : level < target;
    if (target === 1 && level > 1) counts.set(word, (counts.get(word) || 0) + 1);
    else if (step > aim.maxStep && over && level !== (target >= 7 ? 6 : target - 1)) counts.set(`${level}:${word}`, (counts.get(`${level}:${word}`) || 0) + 1);
    else if (measured.level > target && level > target) counts.set(`${level}:${word}`, (counts.get(`${level}:${word}`) || 0) + 1);
    else if (step < aim.minStep && under) {
      /* too easy: caller prints the hint, not every base word */
    }
  });
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  const lines = [];
  lines.push(
    `measured L${measured.level} step ${(step * 100).toFixed(1)}% (want ${(aim.minStep * 100).toFixed(1)}–${(aim.maxStep * 100).toFixed(1)}%) ${measured.chars}字 ${measured.n} tokens`,
  );
  if (measured.missing.length) lines.push(`not in glossary: ${measured.missing.slice(0, 8).join("、")}`);
  if (top.length) lines.push(`replace these: ${top.map(([w, n]) => `${w}×${n}`).join(" ")}`);
  if (step < aim.minStep) {
    const spice = target >= 7 ? "words outside HSK 1–6" : `HSK ${target} words`;
    lines.push(`too easy: add about ${Math.ceil((aim.minStep - step) * measured.n)} tokens of ${spice}`);
  }
  return lines.join("\n");
}

export function loadLookup(app) {
  return app.difficulty.makeHskLookup(loadHsk());
}

export function glossary() {
  return loadGlossary();
}
