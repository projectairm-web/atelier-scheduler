/**
 * Generates Play Store screenshots for Atelier Scheduler.
 * Run AFTER starting the Vite dev server on port 5173:
 *
 *   npm run dev   (separate terminal)
 *   node store/take-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = join(__dir, "screenshots");
mkdirSync(OUT, { recursive: true });

const ss    = (name) => join(OUT, name);
const delay = (ms)   => new Promise(r => setTimeout(r, ms));

/* ── Replicate date.js weekKey exactly (uses UTC ISO, not local) ── */
function getMondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}
function weekKey(date) {
  return getMondayOf(date).toISOString().slice(0, 10);
}

function buildSeed(wk, prevWk) {
  const makeWeek = () => ({
    "0": { milano:["p1","p2"], torino:["p3","p4"], bergamo:["p5"], verona:["p6"] },
    "1": { milano:["p1","p3"], torino:["p2","p5"], bergamo:["p4"], verona:["p6"] },
    "2": { milano:["p2","p4"], torino:["p1","p6"], bergamo:["p3"], verona:["p5"] },
    "3": { milano:["p3","p5"], torino:["p1","p2"], bergamo:["p6"], verona:["p4"] },
    "4": { milano:["p1","p4"], torino:["p2","p3"], bergamo:["p5"], verona:["p6"] },
    "5": { milano:["p5","p6"], torino:[],          bergamo:[],     verona:[]      },
    "6": { milano:[],          torino:[],           bergamo:[],     verona:[]      },
  });
  return {
    stores: [
      { id:"milano",  name:"Milano Duomo",    city:"Milano",  priority:"critica", staffNeeded:2, closed:false },
      { id:"torino",  name:"Torino P. Nuova", city:"Torino",  priority:"critica", staffNeeded:2, closed:false },
      { id:"bergamo", name:"Oriocenter",       city:"Bergamo", priority:"normale", staffNeeded:1, closed:false },
      { id:"verona",  name:"Adigeo",           city:"Verona",  priority:"normale", staffNeeded:1, closed:false },
    ],
    people: [
      { id:"p1", name:"Giulia Rossi",  maxDays:5, notes:"",          availability:[],         blockedStores:[] },
      { id:"p2", name:"Marco Bianchi", maxDays:5, notes:"",          availability:[],         blockedStores:["bergamo"] },
      { id:"p3", name:"Sara Conti",    maxDays:4, notes:"Part-time", availability:[0,1,2,3,4], blockedStores:[] },
      { id:"p4", name:"Luca Ferrari",  maxDays:5, notes:"",          availability:[],         blockedStores:[] },
      { id:"p5", name:"Elena Greco",   maxDays:6, notes:"",          availability:[],         blockedStores:[] },
      { id:"p6", name:"Anna Marino",   maxDays:4, notes:"",          availability:[0,1,2,3,4], blockedStores:[] },
    ],
    schedules: { [wk]: makeWeek(), [prevWk]: makeWeek() },
    absences: {},
  };
}

/* ──────────────────────────────────────────────────────── */

const wk    = weekKey(new Date());
const prevWk = weekKey(new Date(getMondayOf(new Date()).getTime() - 7 * 86400000));
const seed  = buildSeed(wk, prevWk);
console.log("Seeding wk:", wk, "prevWk:", prevWk);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport:          { width: 360, height: 640 },
  deviceScaleFactor: 2,
  colorScheme:       "light",
});
const page = await ctx.newPage();
page.on("pageerror", err => console.error("PAGE ERROR:", err.message));

await page.addInitScript(({ data, key }) => {
  localStorage.setItem(key, JSON.stringify(data));
}, { data: seed, key: "atelier-area-scheduler-v1" });

console.log("Loading app…");
await page.goto("http://localhost:5173");
await page.waitForLoadState("networkidle");
await delay(1200);

/* ── 01  Schedule grid ───────────────────────────────────── */
await page.waitForSelector(".day-cell", { state: "attached", timeout: 10000 });
await delay(200);
console.log("01 — Schedule grid");
await page.screenshot({ path: ss("01-schedule-grid.png") });

/* ── 02  People panel ────────────────────────────────────── */
await page.locator(".bottom-tab").nth(1).click();
await page.waitForSelector(".people-panel", { state: "visible", timeout: 6000 });
await delay(400);
console.log("02 — People panel");
await page.screenshot({ path: ss("02-people-panel.png") });

/* ── 03  Statistics modal ────────────────────────────────── */
await page.locator(".actions-card button").filter({ hasText: /Statistic|Stats|Estad/i }).first().click();
await page.waitForSelector(".stats-modal", { state: "visible", timeout: 5000 });
await delay(400);
console.log("03 — Statistics modal");
await page.screenshot({ path: ss("03-statistics.png") });
await page.locator(".stats-modal .modal-close").click();
await delay(300);

/* ── 04  Settings → People tab ──────────────────────────── */
await page.locator(".btn-settings").nth(1).click();
await page.waitForSelector(".settings-modal", { state: "visible", timeout: 5000 });
await delay(200);
await page.locator(".settings-tab").nth(1).click();
await delay(400);
console.log("04 — Settings People");
await page.screenshot({ path: ss("04-settings-people.png") });
await page.locator(".settings-modal .modal-close").click();
await delay(300);

/* ── 05  Assignment modal ────────────────────────────────── */
await page.locator(".bottom-tab").nth(0).click();
await page.waitForSelector(".day-cell", { state: "attached", timeout: 5000 });
await delay(400);
await page.locator("td .day-cell").first().click();
await page.waitForSelector(".modal-overlay", { state: "visible", timeout: 5000 });
await delay(400);
console.log("05 — Assignment modal");
await page.screenshot({ path: ss("05-assign-modal.png") });
await page.locator(".modal-close").first().click();
await delay(300);

/* ── 06  Absence calendar ────────────────────────────────── */
await page.locator(".btn-settings").nth(0).click();
await page.waitForSelector(".absence-modal", { state: "visible", timeout: 5000 });
await delay(500);
console.log("06 — Absence calendar");
await page.screenshot({ path: ss("06-absences.png") });

await browser.close();
console.log(`\nDone → ${OUT}`);