import * as XLSX from "xlsx";
import { addDays, formatWeekRange } from "./date.js";
import { DAYS_SHORT } from "../constants/index.js";

/* ── Helpers ─────────────────────────────────────────────── */
function dayHeader(monday, i) {
  const d = addDays(monday, i);
  return `${DAYS_SHORT[i]} ${d.getDate()}/${d.getMonth() + 1}`;
}

function applyColWidths(ws, widths) {
  ws["!cols"] = widths.map(w => ({ wch: w }));
}

/* ── Main export ─────────────────────────────────────────── */
export function exportWeekToExcel({ stores, people, weekSchedule, monday }) {
  const wb = XLSX.utils.book_new();
  const dayHeaders = [0, 1, 2, 3, 4, 5, 6].map(i => dayHeader(monday, i));

  /* Sheet 1 — Griglia negozi × giorni */
  const sh1 = [
    ["Negozio", "Città", "Priorità", "Personale necessario", ...dayHeaders, "Turni coperti"],
    ...stores.map(store => {
      const days = [0, 1, 2, 3, 4, 5, 6].map(day => {
        const ids = weekSchedule[day]?.[store.id] || [];
        return ids
          .map(pid => people.find(p => p.id === pid)?.name ?? pid)
          .join(", ");
      });
      const covered = days.filter(Boolean).length;
      return [store.name, store.city, store.priority, store.staffNeeded, ...days, covered];
    }),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sh1);
  applyColWidths(ws1, [22, 12, 10, 10, ...Array(7).fill(22), 8]);
  XLSX.utils.book_append_sheet(wb, ws1, "Pianificazione");

  /* Sheet 2 — Riepilogo per persona */
  const sh2 = [
    ["Persona", "Max giorni", ...dayHeaders, "Giorni lavorati", "Giorni riposo"],
    ...people.map(person => {
      const days = [0, 1, 2, 3, 4, 5, 6].map(day => {
        for (const store of stores) {
          if ((weekSchedule[day]?.[store.id] || []).includes(person.id))
            return store.name;
        }
        return "Riposo";
      });
      const worked = days.filter(d => d !== "Riposo").length;
      return [person.name, person.maxDays, ...days, worked, 7 - worked];
    }),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sh2);
  applyColWidths(ws2, [20, 8, ...Array(7).fill(22), 10, 10]);
  XLSX.utils.book_append_sheet(wb, ws2, "Personale");

  /* Download */
  const label = formatWeekRange(monday)
    .replace(/\s+/g, "_")
    .replace(/–/g, "-")
    .replace(/[^\w_-]/g, "");
  XLSX.writeFile(wb, `Pianificazione_${label}.xlsx`);
}
