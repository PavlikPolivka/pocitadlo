// Počítadlo tracking: receives events from the app, stores them in this
// spreadsheet and emails a daily summary. Setup steps are in README.md.

const EMAILS = "polivka.pavel@gmail.com, n.polivkova22@gmail.com";
const TZ = "Europe/Prague";
const REPORT_HOUR = 19; // daily email on the first hourly check after 19:00
const SHEET = "events";
const HEADER = ["received", "ts", "session", "version", "type", "level", "seconds", "mistakes", "question", "best", "wrong"];
const TYPES = ["open", "start", "finish", "quit"];
const LEVEL_NAMES = {
  level1: "Level 1 (+/− do 10)",
  level2: "Level 2 (+/− 10–20)",
  level3: "Level 3 (přes 10)",
};

function doPost(e) {
  const events = JSON.parse(e.postData.contents);
  if (!Array.isArray(events)) return ContentService.createTextOutput("bad");
  const now = new Date();
  const rows = events
    .filter((ev) => ev && TYPES.includes(ev.type))
    .slice(0, 500)
    .map((ev) => [
      now,
      new Date(ev.ts),
      String(ev.session || "").slice(0, 16),
      String(ev.version || "").slice(0, 40),
      ev.type,
      LEVEL_NAMES[ev.level] ? ev.level : "",
      Number(ev.seconds) || "",
      ev.mistakes == null ? "" : Number(ev.mistakes) || 0,
      Number(ev.question) || "",
      ev.best === true ? "yes" : "",
      Array.isArray(ev.wrong) ? ev.wrong.slice(0, 50).join(" ").slice(0, 500) : "",
    ]);
  if (rows.length) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet_();
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADER.length).setValues(rows);
    } finally {
      lock.releaseLock();
    }
  }
  return ContentService.createTextOutput("ok");
}

// Opening the /exec URL in a browser shows this, to check the deployment and the schedule.
function doGet() {
  const triggers = ScriptApp.getProjectTriggers().map((t) => t.getHandlerFunction()).join(", ") || "NONE, run setup";
  const last = PropertiesService.getScriptProperties().getProperty("lastReport") || "never";
  return ContentService.createTextOutput(`Počítadlo tracking OK\ntriggers: ${triggers}\nlast report: ${last}`);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET);
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function day_(d) {
  return Utilities.formatDate(d, TZ, "yyyy-MM-dd");
}

function time_(d) {
  return Utilities.formatDate(d, TZ, "HH:mm");
}

// Runs every hour; sends today's report once, on the first run after REPORT_HOUR.
// A missed run is caught up by the next one.
function hourlyCheck() {
  const now = new Date();
  const props = PropertiesService.getScriptProperties();
  const today = day_(now);
  if (Number(Utilities.formatDate(now, TZ, "H")) < REPORT_HOUR) return;
  if (props.getProperty("lastReport")?.startsWith(today)) return;
  dailyReport();
  props.setProperty("lastReport", `${today} ${time_(now)}`);
}

// Sends today's report now; can also be run by hand from the editor.
function dailyReport() {
  const today = day_(new Date());
  const values = getSheet_().getDataRange().getValues().slice(1);
  const events = values
    .map((r) => Object.fromEntries(HEADER.map((h, i) => [h, r[i]])))
    .filter((ev) => ev.ts instanceof Date && day_(ev.ts) === today)
    .sort((a, b) => a.ts - b.ts);

  if (events.length === 0) return; // no email on days she didn't play

  const opens = events.filter((e) => e.type === "open").length;
  const finished = events.filter((e) => e.type === "finish");
  const quits = events.filter((e) => e.type === "quit");
  const versions = [...new Set(events.map((e) => e.version).filter(String))];
  const playSeconds = [...finished, ...quits].reduce((s, e) => s + (Number(e.seconds) || 0), 0);

  const perLevel = Object.keys(LEVEL_NAMES)
    .map((id) => {
      const games = finished.filter((e) => e.level === id);
      if (games.length === 0) return "";
      const times = games.map((e) => Number(e.seconds));
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const mistakes = games.reduce((s, e) => s + (Number(e.mistakes) || 0), 0);
      return `<tr><td>${LEVEL_NAMES[id]}</td><td>${games.length}×</td><td>${Math.min(...times)} s</td><td>${avg} s</td><td>${mistakes}</td></tr>`;
    })
    .join("");

  const log = events
    .filter((e) => e.type !== "open")
    .map((e) => {
      const lvl = LEVEL_NAMES[e.level] || e.level;
      if (e.type === "start") return "";
      if (e.type === "finish")
        return `<li>${time_(e.ts)} ✅ ${lvl}: ${e.seconds} s, chyby ${e.mistakes}${e.best === "yes" ? " 🏆 rekord" : ""}${e.wrong ? ` <span style="color:#888">(${e.wrong})</span>` : ""}</li>`;
      return `<li>${time_(e.ts)} ✖️ ${lvl}: odešla u příkladu ${e.question}/10 po ${e.seconds} s</li>`;
    })
    .join("");

  const html = `
    <h2>Počítadlo – ${Utilities.formatDate(new Date(), TZ, "d. M. yyyy")}</h2>
    <p>Spuštění aplikace: <b>${opens}</b><br>
       Dokončené hry: <b>${finished.length}</b>, nedokončené: <b>${quits.length}</b><br>
       Čas hraním: <b>${Math.round(playSeconds / 60)} min</b><br>
       Hrála: ${time_(events[0].ts)}–${time_(events[events.length - 1].ts)}</p>
    ${perLevel ? `<table border="1" cellpadding="6" style="border-collapse:collapse">
      <tr><th>Level</th><th>Her</th><th>Nejlepší</th><th>Průměr</th><th>Chyby</th></tr>${perLevel}</table>` : ""}
    ${log ? `<h3>Průběh</h3><ul>${log}</ul>` : ""}
    <p style="color:#888;font-size:12px">Verze v iPadu: ${versions.join(", ") || "?"}<br>
      <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Všechna data</a></p>`;

  MailApp.sendEmail({ to: EMAILS, name: "Počítadlo", subject: `Počítadlo: ${games_(finished.length)} dnes`, htmlBody: html });
}

function games_(n) {
  if (n === 1) return "1 hra";
  if (n >= 2 && n <= 4) return `${n} hry`;
  return `${n} her`;
}

// Run once by hand to schedule the daily email.
function setup() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("hourlyCheck").timeBased().everyHours(1).create();
  getSheet_();
}
