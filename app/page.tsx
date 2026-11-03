"use client";
import { useEffect, useState } from "react";
import LevelSelectScreen from "@/components/LevelSelectScreen";
import GameScreen from "@/components/GameScreen";
import ResultsScreen from "@/components/ResultsScreen";
import { getBestTime, saveBestTime } from "@/lib/storage";
import { track } from "@/lib/track";

type View = "levelSelect" | "game" | "results";

export default function Home() {
  const [view, setView] = useState<View>("levelSelect");
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [finishedSeconds, setFinishedSeconds] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);

  useEffect(() => {
    track({ type: "open" });
  }, []);

  function startLevel(levelId: string) {
    track({ type: "start", level: levelId });
    setActiveLevel(levelId);
    setView("game");
  }

  function handleComplete(seconds: number, mistakes: number, wrong: string[]) {
    if (!activeLevel) return;
    const prev = getBestTime(activeLevel);
    setPreviousBest(prev);
    const newBest = saveBestTime(activeLevel, seconds);
    track({ type: "finish", level: activeLevel, seconds, mistakes, wrong, best: newBest });
    setIsNewBest(newBest);
    setFinishedSeconds(seconds);
    setView("results");
  }

  if (view === "game" && activeLevel) {
    return (
      <GameScreen
        levelId={activeLevel}
        onComplete={handleComplete}
        onBack={() => setView("levelSelect")}
      />
    );
  }

  if (view === "results" && activeLevel) {
    return (
      <ResultsScreen
        levelId={activeLevel}
        seconds={finishedSeconds}
        isNewBest={isNewBest}
        previousBest={previousBest}
        onRetry={() => startLevel(activeLevel)}
        onBack={() => setView("levelSelect")}
      />
    );
  }

  return <LevelSelectScreen onSelectLevel={startLevel} />;
}
