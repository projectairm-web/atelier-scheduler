export const DAYS_SHORT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export const STORAGE_KEY = "atelier-area-scheduler-v1";

/** Dati di seed mostrati al primo avvio */
export const SEED = {
  stores: [
    { id: "milano",  name: "Milano Duomo",       city: "Milano",  priority: "critica", staffNeeded: 2 },
    { id: "torino",  name: "Torino Porta Nuova",  city: "Torino",  priority: "critica", staffNeeded: 2 },
    { id: "bergamo", name: "Oriocenter",           city: "Bergamo", priority: "normale", staffNeeded: 1 },
    { id: "verona",  name: "Adigeo",               city: "Verona",  priority: "normale", staffNeeded: 1 },
  ],
  people: [
    { id: "p1", name: "Giulia Rossi",  maxDays: 5, notes: "" },
    { id: "p2", name: "Marco Bianchi", maxDays: 5, notes: "" },
    { id: "p3", name: "Sara Conti",    maxDays: 5, notes: "Part-time" },
    { id: "p4", name: "Luca Ferrari",  maxDays: 5, notes: "" },
    { id: "p5", name: "Elena Greco",   maxDays: 6, notes: "" },
    { id: "p6", name: "Anna Marino",   maxDays: 4, notes: "" },
  ],
  schedule: {},
};
