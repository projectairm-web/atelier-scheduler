import { addDays, toLocalDateStr } from "../utils/date.js";

/**
 * Algoritmo di pianificazione automatica — approccio greedy.
 *
 * Vincoli rispettati:
 *  1. Ogni persona lavora in al massimo 1 negozio per giorno.
 *  2. Ogni persona non supera il proprio `maxDays` settimanale.
 *  3. Ogni persona è assegnata solo nei giorni della sua `availability`
 *     (array vuoto = disponibile tutti i giorni della settimana).
 *  4. Le assenze per data specifica (ferie / permesso) vengono rispettate.
 *  5. I negozi "critici" vengono soddisfatti prima di quelli "normali".
 *  6. A parità di disponibilità, chi ha meno giorni già usati viene
 *     preferito (bilanciamento del carico).
 *
 * @param {{ stores, people }} data
 * @param {{ monday?: Date, absences?: Object }} opts
 * @returns {{ [dayIndex: 0-6]: { [storeId]: string[] } }}
 */
export function generateSchedule(data, { monday, absences = {} } = {}) {
  const personDayCount = {};
  data.people.forEach(p => (personDayCount[p.id] = 0));

  const sortedStores = [...data.stores].sort((a, b) => {
    if (a.priority === "critica" && b.priority !== "critica") return -1;
    if (b.priority === "critica" && a.priority !== "critica") return 1;
    return b.staffNeeded - a.staffNeeded;
  });

  const schedule = {};

  for (let day = 0; day < 7; day++) {
    schedule[day] = {};
    const assignedThisDay = new Set();

    // Actual local date string for this slot (used to check absences)
    // Uses toLocalDateStr — NOT toISOString — to avoid UTC offset issues
    const dateStr = monday ? toLocalDateStr(addDays(monday, day)) : null;

    for (const store of sortedStores) {
      if (store.closed) { schedule[day][store.id] = []; continue; }
      const assigned = [];

      const available = [...data.people]
        .filter(p => {
          // Already used today
          if (assignedThisDay.has(p.id)) return false;
          // Weekly cap
          if (personDayCount[p.id] >= p.maxDays) return false;
          // Day-of-week availability ([] = all days)
          const av = p.availability ?? [];
          if (av.length > 0 && !av.includes(day)) return false;
          // Absence on this specific date (ferie / permesso)
          if (dateStr && absences[p.id]?.[dateStr]) return false;
          return true;
        })
        .sort((a, b) => {
          const ua = personDayCount[a.id];
          const ub = personDayCount[b.id];
          if (ua !== ub) return ua - ub;
          return b.maxDays - a.maxDays;
        });

      for (const person of available) {
        if (assigned.length >= store.staffNeeded) break;
        assigned.push(person.id);
        assignedThisDay.add(person.id);
        personDayCount[person.id]++;
      }

      schedule[day][store.id] = assigned;
    }
  }

  return schedule;
}
