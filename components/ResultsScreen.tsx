"use client";
import { LEVELS } from "@/lib/levels";

interface Props {
  levelId: string;
  seconds: number;
  isNewBest: boolean;
  previousBest: number | null;
  onRetry: () => void;
  onBack: () => void;
}

export default function ResultsScreen({
  levelId,
  seconds,
  isNewBest,
  previousBest,
  onRetry,
  onBack,
}: Props) {
  const level = LEVELS.find((l) => l.id === levelId)!;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="text-8xl">🎉</div>

      <div>
        <p className={`text-2xl font-extrabold ${level.color}`}>{level.name}</p>
        <h1 className="text-5xl font-extrabold text-slate-700 mt-1">Hotovo!</h1>
      </div>

      <div className="bg-white rounded-3xl border-2 border-slate-200 px-10 py-6 shadow-sm">
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Tvůj čas</p>
        <p className="text-6xl font-extrabold text-slate-700 mt-1">{seconds}s</p>
        {isNewBest ? (
          <p className="mt-3 text-emerald-500 font-bold text-lg">
            🏆 Nový rekord!
          </p>
        ) : previousBest !== null ? (
          <p className="mt-3 text-slate-400 text-sm">
            Tvůj rekord: {previousBest}s
          </p>
        ) : null}
      </div>

      {isNewBest && previousBest !== null && (
        <p className="text-slate-500">Lepší než předtím! 🚀</p>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 font-bold text-lg active:scale-95 transition-transform"
        >
          Zpět
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-4 rounded-2xl bg-amber-400 border-2 border-amber-500 text-white font-bold text-lg active:scale-95 transition-transform shadow-sm"
        >
          Znovu
        </button>
      </div>
    </div>
  );
}
