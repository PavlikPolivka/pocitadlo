export type Operation = "+" | "-";

export interface Question {
  a: number;
  b: number;
  op: Operation;
  answer: number;
}

export interface Level {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  bgColor: string;
  generate: () => Question[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick10(pool: Question[]): Question[] {
  const shuffled = shuffle(pool);
  return shuffled.slice(0, Math.min(10, shuffled.length));
}

function generateLevel1(): Question[] {
  const pool: Question[] = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      if (a + b <= 10) pool.push({ a, b, op: "+", answer: a + b });
      if (a - b >= 1) pool.push({ a, b, op: "-", answer: a - b });
    }
  }
  return pick10(pool);
}

function generateLevel2(): Question[] {
  const pool: Question[] = [];
  for (let a = 10; a <= 20; a++) {
    for (let b = 1; b <= 10; b++) {
      if (a + b <= 20) pool.push({ a, b, op: "+", answer: a + b });
      if (a - b >= 10) pool.push({ a, b, op: "-", answer: a - b });
    }
  }
  return pick10(pool);
}

function generateLevel3(): Question[] {
  // Cross-ten: sums where result crosses 10 (e.g. 8+5=13, 7+4=11)
  const pool: Question[] = [];
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      const sum = a + b;
      if (sum > 10 && sum <= 19) {
        pool.push({ a, b, op: "+", answer: sum });
      }
    }
  }
  // Cross-ten subtraction: e.g. 13-5=8, 12-4=8
  for (let a = 11; a <= 19; a++) {
    for (let b = 2; b <= 9; b++) {
      const diff = a - b;
      if (diff >= 1 && diff <= 9) {
        pool.push({ a, b, op: "-", answer: diff });
      }
    }
  }
  return pick10(pool);
}

export const LEVELS: Level[] = [
  {
    id: "level1",
    name: "Level 1",
    subtitle: "+/− do 10",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    generate: generateLevel1,
  },
  {
    id: "level2",
    name: "Level 2",
    subtitle: "+/− 10 − 20",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    generate: generateLevel2,
  },
  {
    id: "level3",
    name: "Level 3",
    subtitle: "+/− přes 10",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    generate: generateLevel3,
  },
];
