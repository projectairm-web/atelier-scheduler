import { addDays, toLocalDateStr } from "../utils/date.js";

/* Fisher-Yates shuffle — returns a new array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Greedy scheduler with randomisation.
 *
 * Constraints respected:
 *  1. One store per person per day.
 *  2. Weekly maxDays cap per person.
 *  3. Day-of-week availability (empty = all days).
 *  4. Specific-date absences (ferie / permesso).
 *  5. Store restrictions per person (blockedStores).
 *  6. Closed stores are skipped entirely.
 *  7. Critical stores filled first.
 *  8. Load balancing: fewer days worked → higher priority.
 *  9. Randomisation: among tied candidates the order is shuffled
 *     so the same solution is not always generated.
 */
export function generateSchedule(data, { monday, absences = {} } = {}) {
  const personDayCount = {};
  data.people.forEach(p => (personDayCount[p.id] = 0));

  const sortedStores = [...data.stores].sort((a, b) => {
    if (a.priority === "critica" && b.priority !== "critica") return -1;
    if (b.priority === "critica" && a.priority !== "critica") return 1;
    return b.staffNeeded - a.staffNeeded;
  });

  // Pre-shuffle people once per schedule generation so that when two
  // candidates are equally loaded the random order determines who goes first.
  const shuffledPeople = shuffle(data.people);

  const schedule = {};

  for (let day = 0; day < 7; day++) {
    schedule[day] = {};
    const assignedThisDay = new Set();
    const dateStr = monday ? toLocalDateStr(addDays(monday, day)) : null;

    for (const store of sortedStores) {
      if (store.closed) { schedule[day][store.id] = []; continue; }

      const assigned  = [];
      const available = shuffledPeople.filter(p => {
        if (assignedThisDay.has(p.id))                            return false;
        if (personDayCount[p.id] >= p.maxDays)                    return false;
        const av = p.availability ?? [];
        if (av.length > 0 && !av.includes(day))                   return false;
        if (dateStr && absences[p.id]?.[dateStr])                  return false;
        const blocked = p.blockedStores ?? [];
        if (blocked.includes(store.id))                            return false;
        return true;
      }).sort((a, b) => {
        // Primary: fewer days worked first (load balancing)
        const diff = personDayCount[a.id] - personDayCount[b.id];
        if (diff !== 0) return diff;
        // Secondary: higher maxDays first (more capacity)
        return b.maxDays - a.maxDays;
        // Ties broken by the pre-shuffled order — no extra sort key needed
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