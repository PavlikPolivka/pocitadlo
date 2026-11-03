"use client";
import { useEffect, useState } from "react";
import { LEVELS } from "@/lib/levels";
import { getBestTime } from "@/lib/storage";

interface Props {
  onSelectLevel: (levelId: string) => void;
}

export default function LevelSelectScreen({ onSelectLevel }: Props) {
  const [bestTimes, setBestTimes] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const times: Record<string, number | null> = {};
    LEVELS.forEach((l) => {
      times[l.id] = getBestTime(l.id);
    });
    setBestTimes(times);
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="pt-12 pb-6 px-6 text-center">
        <h1 className="text-5xl font-extrabold text-amber-500 tracking-tight drop-shadow-sm">
          Počítadlo
        </h1>
        <p className="mt-1 text-slate-400 text-sm">Vyber si level a počítej!</p>
      </header>

      <div className="flex-1 px-5 pb-10 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {LEVELS.map((level) => {
          const best = bestTimes[level.id];
          return (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              className={`w-full flex items-center justify-between rounded-3xl border-2 px-6 py-5 text-left shadow-sm active:scale-[0.98] transition-transform ${level.bgColor}`}
            >
              <div>
                <p className={`text-xl font-extrabold ${level.color}`}>{level.name}</p>
                <p className="text-slate-500 text-sm mt-0.5">{level.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                {best != null ? (
                  <span
                    className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full bg-white border ${level.color} border-current`}
                  >
                    🏆 {best}s
                  </span>
                ) : (
                  <span className="text-slate-300 text-xl font-bold tracking-widest">− −</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="pb-4 text-center text-xs text-slate-300">
        verze {process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
    </div>
  );
}
