import { describe, expect, it } from "vitest";
import { mandarinVoice, speakSupport, speechChunks, tokensInRange } from "./speech";

describe("speechChunks", () => {
  it("keeps the stop with its sentence", () => {
    expect(speechChunks("我是学生。她是老师。")).toEqual([
      { text: "我是学生。", start: 0, end: 5 },
      { text: "她是老师。", start: 5, end: 10 },
    ]);
  });

  it("breaks on a question, an exclamation, and a line break", () => {
    expect(speechChunks("你好吗？\n我很好！").map((chunk) => chunk.text)).toEqual([
      "你好吗？",
      "我很好！",
    ]);
  });

  it("drops blank pieces", () => {
    expect(speechChunks("  第一句。\n\n第二句。  ").map((chunk) => chunk.text)).toEqual([
      "第一句。",
      "第二句。",
    ]);
  });

  it("keeps a short story with no stops as one chunk", () => {
    expect(speechChunks("没有句号")).toEqual([{ text: "没有句号", start: 0, end: 4 }]);
  });

  it("splits a long sentence at a comma so the voice is not cut off", () => {
    const head = "甲".repeat(40);
    const tail = "乙".repeat(40);
    const body = `${head}，${tail}。`;
    const chunks = speechChunks(body);
    expect(chunks.map((chunk) => chunk.text)).toEqual([`${head}，`, `${tail}。`]);
    expect(chunks[0].start).toBe(0);
    expect(chunks[1].start).toBe(head.length + 1);
  });
});

describe("mandarinVoice", () => {
  it("prefers mainland Mandarin and will not use Cantonese as a stand-in", () => {
    const voices = [{ lang: "en-US" }, { lang: "zh-HK" }, { lang: "zh-TW" }, { lang: "zh-CN" }];
    expect(mandarinVoice(voices)?.lang).toBe("zh-CN");
  });

  it("returns null when the only Chinese voice is Cantonese", () => {
    expect(mandarinVoice([{ lang: "zh-HK" }, { lang: "en-US" }])).toBeNull();
  });
});

describe("speakSupport", () => {
  it("hides the control when the browser cannot speak", () => {
    expect(speakSupport(false, [], true)).toBe("hidden");
  });

  it("shows Play while the voice list is still empty", () => {
    expect(speakSupport(true, [], false)).toBe("ready");
  });

  it("explains instead of offering Play once it knows there is no Mandarin voice", () => {
    expect(speakSupport(true, [{ lang: "en-US" }], true)).toBe("none");
  });
});

describe("tokensInRange", () => {
  it("marks the tokens that overlap a spoken sentence", () => {
    const tokens = [{ text: "我是" }, { text: "学生" }, { text: "。" }, { text: "她" }];
    expect(tokensInRange(tokens, 0, 5)).toEqual({ from: 0, to: 3 });
  });
});
