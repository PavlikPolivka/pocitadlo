"use client";
import { useEffect, useState, useCallback } from "react";
import { LEVELS, Question } from "@/lib/levels";
import { useTimer, formatTime } from "@/lib/timer";
import NumberKeypad from "./NumberKeypad";

interface Props {
  levelId: string;
  onComplete: (seconds: number) => void;
  onBack: () => void;
}

export default function GameScreen({ levelId, onComplete, onBack }: Props) {
  const level = LEVELS.find((l) => l.id === levelId)!;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<"" | "correct" | "wrong">("");
  const { elapsed, reset } = useTimer(questions.length > 0);

  useEffect(() => {
    reset();
    setQuestions(level.generate());
    setCurrent(0);
    setInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  const q = questions[current];

  const handleConfirm = useCallback(() => {
    if (!input) return;
    const userAnswer = parseInt(input, 10);
    if (userAnswer === q?.answer) {
      setFlash("correct");
      setTimeout(() => {
        setFlash("");
        if (current + 1 >= questions.length) {
          onComplete(elapsed);
        } else {
          setCurrent((c) => c + 1);
          setInput("");
        }
      }, 400);
    } else {
      setShake(true);
      setFlash("wrong");
      setTimeout(() => {
        setShake(false);
        setFlash("");
        setInput("");
      }, 600);
    }
  }, [input, q, current, questions.length, elapsed, onComplete]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") setInput((prev) => (prev.length < 3 ? prev + e.key : prev));
      else if (e.key === "Backspace") setInput((prev) => prev.slice(0, -1));
      else if (e.key === "Enter") handleConfirm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleConfirm]);

  if (!q) return null;

  const answerBg =
    flash === "correct"
      ? "bg-emerald-100 border-emerald-400"
      : flash === "wrong"
      ? "bg-red-100 border-red-400"
      : "bg-white border-slate-200";

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="flex items-center px-5 pt-10 pb-4 gap-3">
        <button
          onClick={onBack}
          className="text-2xl text-slate-400 active:text-slate-600 transition-colors p-1"
          aria-label="Zpět"
        >
          ←
        </button>
        <h2 className={`text-xl font-extrabold ${level.color}`}>{level.name}</h2>
        <div className="ml-auto flex items-center gap-1 text-slate-500 text-sm font-mono">
          🕐 {formatTime(elapsed)}
        </div>
      </header>

      <div className="px-5 mb-2 text-center">
        <p className="text-slate-400 text-sm font-semibold">
          {current + 1} / {questions.length}
        </p>
        <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-amber-400"
            style={{ width: `${(current / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        <div
          className={`text-7xl font-extrabold text-slate-700 tracking-tight transition-all ${
            shake ? "animate-shake" : ""
          }`}
        >
          {q.a} {q.op} {q.b}
        </div>

        <div
          className={`w-36 h-20 rounded-2xl border-2 flex items-center justify-center text-5xl font-extrabold text-slate-700 transition-colors ${answerBg}`}
        >
          {input || <span className="text-slate-300">?</span>}
        </div>

        <NumberKeypad
          onDigit={(d) => setInput((prev) => (prev.length < 3 ? prev + d : prev))}
          onBackspace={() => setInput((prev) => prev.slice(0, -1))}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}
