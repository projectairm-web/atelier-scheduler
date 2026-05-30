import * as XLSX from "xlsx";
import { Capacitor } from "@capacitor/core";
import { addDays, formatWeekRange } from "./date.js";
import { displayName } from "./people.js";
import { DAYS_SHORT } from "../constants/index.js";

/* ── Helpers ─────────────────────────────────────────────── */
function dayHeader(monday, i) {
  const d = addDays(monday, i);
  return `${DAYS_SHORT[i]} ${d.getDate()}/${d.getMonth() + 1}`;
}

function applyColWidths(ws, widths) {
  ws["!cols"] = widths.map(w => ({ wch: w }));
}

function buildFilename(monday, ext) {
  const label = formatWeekRange(monday)
    .replace(/\s+/g, "_")
    .replace(/–/g, "-")
    .replace(/[^\w_-]/g, "");
  return `Pianificazione_${label}.${ext}`;
}

/* ── Share a file on Android ─────────────────────────────── */
async function shareFile(base64, filename, mimeType, dialogTitle) {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Share }                 = await import("@capacitor/share");
  await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
  const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });
  await Share.share({ title: filename, url: uri, dialogTitle });
}

/* ═══════════════════════════════════════════════════════════
   EXCEL EXPORT
═══════════════════════════════════════════════════════════ */
export async function exportWeekToExcel({ stores, people, weekSchedule, monday }) {
  const wb         = XLSX.utils.book_new();
  const dayHeaders = [0, 1, 2, 3, 4, 5, 6].map(i => dayHeader(monday, i));

  const sh1 = [
    ["Negozio", "Città", "Priorità", "Personale necessario", ...dayHeaders, "Turni coperti"],
    ...stores.map(store => {
      if (store.closed) return [store.name, store.city, "CHIUSO", 0, ...Array(7).fill("—"), 0];
      const days = [0, 1, 2, 3, 4, 5, 6].map(day => {
        const ids = weekSchedule[day]?.[store.id] || [];
        return ids.map(pid => people.find(p => p.id === pid)?.name ?? pid).join(", ");
      });
      const covered = days.filter(Boolean).length;
      return [store.name, store.city, store.priority, store.staffNeeded, ...days, covered];
    }),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sh1);
  applyColWidths(ws1, [22, 12, 10, 10, ...Array(7).fill(22), 8]);
  XLSX.utils.book_append_sheet(wb, ws1, "Pianificazione");

  const sh2 = [
    ["Persona", "Max giorni", ...dayHeaders, "Giorni lavorati", "Giorni riposo"],
    ...people.map(person => {
      const days = [0, 1, 2, 3, 4, 5, 6].map(day => {
        for (const store of stores) {
          if ((weekSchedule[day]?.[store.id] || []).includes(person.id)) return store.name;
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

  const filename = buildFilename(monday, "xlsx");
  if (Capacitor.isNativePlatform()) {
    const base64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
    await shareFile(base64, filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Esporta pianificazione");
  } else {
    XLSX.writeFile(wb, filename);
  }
}

/* ═══════════════════════════════════════════════════════════
   PDF EXPORT
═══════════════════════════════════════════════════════════ */
export async function exportWeekToPdf({ stores, people, weekSchedule, monday }) {
  const { default: jsPDF }    = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const weekLabel = formatWeekRange(monday);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Atelier Scheduler", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Week: ${weekLabel}`, 14, 21);

  const dayHeaders = [0,1,2,3,4,5,6].map(i => {
    const d = addDays(monday, i);
    return `${DAYS_SHORT[i]} ${d.getDate()}/${d.getMonth()+1}`;
  });

  const head = [["Store", "City", ...dayHeaders]];
  const body = stores.map(store => {
    if (store.closed) {
      return [
        { content: store.name, styles: { textColor: [150,150,150] } },
        { content: store.city, styles: { textColor: [150,150,150] } },
        ...Array(7).fill({ content: "Closed", styles: { textColor: [150,150,150], halign: "center", fontStyle: "italic" } }),
      ];
    }
    return [
      store.name,
      store.city,
      ...[0,1,2,3,4,5,6].map(day => {
        const ids = weekSchedule[day]?.[store.id] || [];
        return ids.map(pid => {
          const p = people.find(p => p.id === pid);
          return p ? displayName(p.name) : pid;
        }).join(", ") || "—";
      }),
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: 27,
    styles:     { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [181, 129, 58], textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 22 } },
    alternateRowStyles: { fillColor: [250, 248, 245] },
  });

  const filename = buildFilename(monday, "pdf");
  if (Capacitor.isNativePlatform()) {
    const base64 = doc.output("datauristring").split(",")[1];
    await shareFile(base64, filename, "application/pdf", "Esporta PDF");
  } else {
    doc.save(filename);
  }
}

/* ═══════════════════════════════════════════════════════════
   SHARE AS TEXT (WhatsApp / email)
═══════════════════════════════════════════════════════════ */
export async function shareWeekText({ stores, people, weekSchedule, monday, days }) {
  const weekLabel = formatWeekRange(monday);
  let text = `📅 ${weekLabel}\nAtelier Scheduler\n`;

  stores.forEach(store => {
    if (store.closed) return;
    text += `\n🏪 ${store.name}`;
    if (store.city) text += ` (${store.city})`;
    text += "\n";

    [0,1,2,3,4,5,6].forEach(day => {
      const ids = weekSchedule[day]?.[store.id] || [];
      if (ids.length > 0) {
        const names = ids.map(pid => {
          const p = people.find(p => p.id === pid);
          return p ? displayName(p.name) : pid;
        }).join(", ");
        text += `  ${days[day]}: ${names}\n`;
      }
    });
  });

  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title: `Schedule ${weekLabel}`, text, dialogTitle: "Share schedule" });
    } else if (navigator.share) {
      await navigator.share({ title: `Schedule ${weekLabel}`, text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  } catch {}
}