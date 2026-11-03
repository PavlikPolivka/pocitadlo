// Sends play events to a Google Apps Script web app (see tracking/README.md).
// Events are queued in localStorage so nothing is lost while the iPad is offline.

const URL = process.env.NEXT_PUBLIC_TRACK_URL;
const QUEUE_KEY = "pocitadlo_events";

export type TrackEvent =
  | { type: "open" }
  | { type: "start"; level: string }
  | { type: "finish"; level: string; seconds: number; mistakes: number; wrong: string[]; best: boolean }
  | { type: "quit"; level: string; seconds: number; question: number; mistakes: number };

type Queued = TrackEvent & { ts: string; session: string; version: string };

const session =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

function readQueue(): Queued[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeQueue(q: Queued[]) {
  try {
    // Cap so a long offline stretch can't grow storage forever.
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-500)));
  } catch {}
}

let flushing = false;

export async function flush() {
  if (!URL || flushing || typeof window === "undefined") return;
  const batch = readQueue();
  if (batch.length === 0) return;
  flushing = true;
  try {
    // text/plain + no-cors avoids a CORS preflight, which Apps Script can't answer.
    await fetch(URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(batch),
    });
    // Opaque response: a resolved fetch means it reached Google.
    writeQueue(readQueue().slice(batch.length));
  } catch {
    // Offline; retry on the next event or when back online.
  } finally {
    flushing = false;
  }
}

export function track(event: TrackEvent) {
  if (!URL || typeof window === "undefined") return;
  writeQueue([
    ...readQueue(),
    {
      ...event,
      ts: new Date().toISOString(),
      session,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "",
    },
  ]);
  flush();
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => flush());
}
