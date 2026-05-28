/** Ritorna il lunedì della settimana che contiene `date`. */
export function getMondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

/** Aggiunge `n` giorni a `date` (n può essere negativo). */
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Restituisce la data come stringa ISO locale (YYYY-MM-DD)
 * senza conversione UTC — necessario per confrontare con le
 * date di assenza salvate dal calendario.
 */
export function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Chiave stringa ISO della settimana (es. "2025-05-19"). */
export function weekKey(date) {
  return getMondayOf(date).toISOString().slice(0, 10);
}

/**
 * Formatta l'intervallo della settimana nella lingua richiesta.
 * @param {Date}   monday
 * @param {string} locale  BCP-47 locale tag (default "it-IT")
 */
export function formatWeekRange(monday, locale = "it-IT") {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const monthFmt = (d, style) =>
    d.toLocaleDateString(locale, { month: style });

  if (sameMonth) {
    return `${monday.getDate()} – ${sunday.getDate()} ${monthFmt(sunday, "long")}`;
  }
  return `${monday.getDate()} ${monthFmt(monday, "short")} – ${sunday.getDate()} ${monthFmt(sunday, "short")}`;
}
