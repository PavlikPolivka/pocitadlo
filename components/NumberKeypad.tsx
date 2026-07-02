"use client";

interface Props {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
}

export default function NumberKeypad({ onDigit, onBackspace, onConfirm }: Props) {
  const btn =
    "flex items-center justify-center rounded-2xl text-3xl font-bold select-none active:scale-95 transition-transform cursor-pointer shadow-sm";

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button
          key={d}
          onClick={() => onDigit(d)}
          className={`${btn} bg-white border-2 border-slate-200 text-slate-700 h-16`}
        >
          {d}
        </button>
      ))}
      <button
        onClick={onBackspace}
        className={`${btn} bg-slate-100 border-2 border-slate-200 text-slate-500 h-16`}
        aria-label="Vymazat"
      >
        ⌫
      </button>
      <button
        onClick={() => onDigit("0")}
        className={`${btn} bg-white border-2 border-slate-200 text-slate-700 h-16`}
      >
        0
      </button>
      <button
        onClick={onConfirm}
        className={`${btn} bg-emerald-400 border-2 border-emerald-500 text-white h-16`}
        aria-label="Potvrdit"
      >
        ✓
      </button>
    </div>
  );
}
