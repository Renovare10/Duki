import { useEffect, useRef, useState } from "react";
import { mandarinVoice, speakSupport, speechChunks, type SpeakSupport } from "../lib/speech";

type Range = { start: number; end: number };

type Props = {
  body: string;
  onSpeaking: (range: Range | null) => void;
};

const RATE = 0.85;

export function VoicePlayer({ body, onSpeaking }: Props) {
  const chunks = speechChunks(body);
  const [support, setSupport] = useState<SpeakSupport>(() =>
    speakSupport(
      typeof window !== "undefined" && Boolean(window.speechSynthesis),
      window.speechSynthesis?.getVoices() ?? [],
      false,
    ),
  );
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const onSpeakingRef = useRef(onSpeaking);
  onSpeakingRef.current = onSpeaking;
  const playingRef = useRef(false);
  const indexRef = useRef(0);
  const runRef = useRef(0);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const check = () => setSupport(speakSupport(true, synth.getVoices(), true));
    if (synth.getVoices().length) check();
    synth.addEventListener("voiceschanged", check);
    return () => synth.removeEventListener("voiceschanged", check);
  }, []);

  useEffect(() => {
    indexRef.current = 0;
    setIndex(0);
    return () => stop(true);
    // Fresh story, fresh place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  function stop(reset: boolean) {
    runRef.current += 1;
    playingRef.current = false;
    window.speechSynthesis?.cancel();
    if (reset) {
      indexRef.current = 0;
      setIndex(0);
    }
    setPlaying(false);
    onSpeakingRef.current(null);
  }

  function show(at: number) {
    const chunk = speechChunks(body)[at];
    onSpeakingRef.current(chunk ? { start: chunk.start, end: chunk.end } : null);
  }

  function play() {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const voice = mandarinVoice(synth.getVoices());
    if (!voice) {
      setSupport("none");
      return;
    }
    const pieces = speechChunks(body);
    if (!pieces.length) return;
    if (indexRef.current >= pieces.length) {
      indexRef.current = 0;
      setIndex(0);
    }
    const run = runRef.current + 1;
    runRef.current = run;
    playingRef.current = true;
    setPlaying(true);

    const speak = () => {
      if (runRef.current !== run) return;
      const at = indexRef.current;
      const chunk = pieces[at];
      if (!chunk) {
        indexRef.current = 0;
        setIndex(0);
        playingRef.current = false;
        setPlaying(false);
        onSpeakingRef.current(null);
        return;
      }
      setIndex(at);
      onSpeakingRef.current({ start: chunk.start, end: chunk.end });
      const utter = new SpeechSynthesisUtterance(chunk.text);
      utter.voice = voice;
      utter.lang = "zh-CN";
      utter.rate = RATE;
      utter.onend = () => {
        if (runRef.current !== run) return;
        indexRef.current = at + 1;
        speak();
      };
      utter.onerror = (event) => {
        if (event.error === "interrupted" || event.error === "canceled") return;
        if (runRef.current !== run) return;
        playingRef.current = false;
        setPlaying(false);
        onSpeakingRef.current(null);
      };
      synth.speak(utter);
    };
    speak();
  }

  function skip(delta: number) {
    const pieces = speechChunks(body);
    if (!pieces.length) return;
    const next = Math.min(pieces.length - 1, Math.max(0, indexRef.current + delta));
    const wasPlaying = playingRef.current;
    stop(false);
    indexRef.current = next;
    setIndex(next);
    show(next);
    if (wasPlaying) play();
  }

  if (support === "hidden" || chunks.length === 0) return null;

  if (support === "none") {
    return (
      <p className="voice-note" role="status">
        No Mandarin voice on this device.
      </p>
    );
  }

  return (
    <div className="voice-player">
      <button type="button" className="voice-play" onClick={() => skip(-1)} disabled={index === 0}>
        Back
      </button>
      <button
        type="button"
        className="voice-play"
        onClick={() => (playingRef.current ? stop(false) : play())}
      >
        {playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        className="voice-play"
        onClick={() => skip(1)}
        disabled={index >= chunks.length - 1}
      >
        Ahead
      </button>
      <span className="voice-place">
        {index + 1} / {chunks.length}
      </span>
    </div>
  );
}
