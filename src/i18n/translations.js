/* ────────────────────────────────────────────────────────────
   All UI strings for IT / EN / ES.
   Function-valued keys accept dynamic arguments.
   Internal data keys (store IDs, person IDs, absence types)
   are never translated — only display labels are.
──────────────────────────────────────────────────────────── */

export const translations = {

  /* ── ITALIANO ─────────────────────────────────────────── */
  it: {
    locale: "it-IT",

    // Header
    brandSub:   "Pianificazione",
    today:      "Oggi",
    absences:   "Assenze",
    settings:   "Impostazioni",

    // Bottom nav
    tabSchedule: "Pianificazione",
    tabStaff:    "Personale",

    // Days (Mon = 0)
    days: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],

    // Months (Jan = 0)
    months: [
      "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
      "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
    ],

    // Schedule grid
    storeCol:  "Negozio",
    critical:  "Critica",
    normal:    "Normale",

    // People panel
    staffTitle:   "Personale",
    daysOf:       (u, m) => `${u} / ${m} giorni`,
    generate:     "Genera pianificazione",
    exportExcel:  "Esporta Excel",
    clearWeek:    "Svuota settimana",
    legend:       "Legenda",
    understaffed: "Personale incompleto",
    legendCritical: "Negozio critico",
    legendNormal:   "Negozio normale",

    // Absence types
    leaveLabel:      "Ferie",
    permissionLabel: "Permesso",
    leaveShort:      "F",
    permissionShort: "P",

    // Assign modal
    assignSub:       (max) => `assegna personale (max ${max})`,
    alreadyToday:    "già assegnato oggi",
    unavailableDay:  "non disponibile questo giorno",
    maxReached:      (m) => `massimo raggiunto (${m} gg)`,
    onLeave:         "in ferie",
    onPermission:    "permesso",
    daysCount:       (u, m) => `${u} / ${m} giorni`,

    // Settings modal
    settingsTitle:   "Impostazioni",
    storesTab:       (n) => `Negozi (${n})`,
    peopleTab:       (n) => `Personale (${n})`,
    storeName:       "Nome negozio",
    storeNamePh:     "es. Milano Duomo",
    city:            "Città",
    cityPh:          "es. Milano",
    priority:        "Priorità",
    staffNeeded:     "Personale",
    criticalOpt:     "🔴 Critica",
    normalOpt:       "🔵 Normale",
    addStore:        "Aggiungi negozio",
    nameLabel:       "Nome",
    maxDaysLabel:    "Max giorni/sett.",
    availability:    "Disponibilità",
    notesLabel:      "Note",
    notesPh:         "es. Part-time",
    addPerson:       "Aggiungi persona",
    autoSave:        "Le modifiche vengono salvate automaticamente. Rigenera la pianificazione per applicarle.",

    // Absence calendar
    absencesTitle:   "Assenze & Ferie",
    totalAbsences:   (n) => `${n} giorno/i`,
    leaveStat:       (n) => `${n} ferie`,
    permStat:        (n) => `${n} permessi`,
    clickCycleLine1: "Clicca un giorno per ciclare:",
    clickCycleLine2: "nessuna → Ferie → Permesso",
  },

  /* ── ENGLISH ──────────────────────────────────────────── */
  en: {
    locale: "en-GB",

    brandSub:   "Scheduling",
    today:      "Today",
    absences:   "Absences",
    settings:   "Settings",

    // Bottom nav
    tabSchedule: "Schedule",
    tabStaff:    "Staff",

    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    months: [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ],

    storeCol:  "Store",
    critical:  "Critical",
    normal:    "Normal",

    staffTitle:   "Staff",
    daysOf:       (u, m) => `${u} / ${m} days`,
    generate:     "Generate schedule",
    exportExcel:  "Export Excel",
    clearWeek:    "Clear week",
    legend:       "Legend",
    understaffed: "Understaffed",
    legendCritical: "Critical store",
    legendNormal:   "Normal store",

    leaveLabel:      "Leave",
    permissionLabel: "Day off",
    leaveShort:      "L",
    permissionShort: "D",

    assignSub:       (max) => `assign staff (max ${max})`,
    alreadyToday:    "already assigned today",
    unavailableDay:  "not available this day",
    maxReached:      (m) => `max reached (${m} days)`,
    onLeave:         "on leave",
    onPermission:    "day off",
    daysCount:       (u, m) => `${u} / ${m} days`,

    settingsTitle:   "Settings",
    storesTab:       (n) => `Stores (${n})`,
    peopleTab:       (n) => `Staff (${n})`,
    storeName:       "Store name",
    storeNamePh:     "e.g. London Bridge",
    city:            "City",
    cityPh:          "e.g. London",
    priority:        "Priority",
    staffNeeded:     "Staff needed",
    criticalOpt:     "🔴 Critical",
    normalOpt:       "🔵 Normal",
    addStore:        "Add store",
    nameLabel:       "Name",
    maxDaysLabel:    "Max days/week",
    availability:    "Availability",
    notesLabel:      "Notes",
    notesPh:         "e.g. Part-time",
    addPerson:       "Add person",
    autoSave:        "Changes are saved automatically. Regenerate the schedule to apply them.",

    absencesTitle:   "Absences & Leave",
    totalAbsences:   (n) => `${n} day(s)`,
    leaveStat:       (n) => `${n} leave days`,
    permStat:        (n) => `${n} days off`,
    clickCycleLine1: "Click a day to cycle:",
    clickCycleLine2: "none → Leave → Day off",
  },

  /* ── ESPAÑOL ──────────────────────────────────────────── */
  es: {
    locale: "es-ES",

    brandSub:   "Planificación",
    today:      "Hoy",
    absences:   "Ausencias",
    settings:   "Configuración",

    // Bottom nav
    tabSchedule: "Planificación",
    tabStaff:    "Personal",

    days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],

    months: [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ],

    storeCol:  "Tienda",
    critical:  "Crítica",
    normal:    "Normal",

    staffTitle:   "Personal",
    daysOf:       (u, m) => `${u} / ${m} días`,
    generate:     "Generar planificación",
    exportExcel:  "Exportar Excel",
    clearWeek:    "Vaciar semana",
    legend:       "Leyenda",
    understaffed: "Personal insuficiente",
    legendCritical: "Tienda crítica",
    legendNormal:   "Tienda normal",

    leaveLabel:      "Vacaciones",
    permissionLabel: "Permiso",
    leaveShort:      "V",
    permissionShort: "P",

    assignSub:       (max) => `asignar personal (máx ${max})`,
    alreadyToday:    "ya asignado hoy",
    unavailableDay:  "no disponible este día",
    maxReached:      (m) => `máximo alcanzado (${m} días)`,
    onLeave:         "de vacaciones",
    onPermission:    "con permiso",
    daysCount:       (u, m) => `${u} / ${m} días`,

    settingsTitle:   "Configuración",
    storesTab:       (n) => `Tiendas (${n})`,
    peopleTab:       (n) => `Personal (${n})`,
    storeName:       "Nombre de tienda",
    storeNamePh:     "ej. Madrid Centro",
    city:            "Ciudad",
    cityPh:          "ej. Madrid",
    priority:        "Prioridad",
    staffNeeded:     "Personal necesario",
    criticalOpt:     "🔴 Crítica",
    normalOpt:       "🔵 Normal",
    addStore:        "Añadir tienda",
    nameLabel:       "Nombre",
    maxDaysLabel:    "Máx días/semana",
    availability:    "Disponibilidad",
    notesLabel:      "Notas",
    notesPh:         "ej. Media jornada",
    addPerson:       "Añadir persona",
    autoSave:        "Los cambios se guardan automáticamente. Regenera la planificación para aplicarlos.",

    absencesTitle:   "Ausencias y Vacaciones",
    totalAbsences:   (n) => `${n} día(s)`,
    leaveStat:       (n) => `${n} días de vacaciones`,
    permStat:        (n) => `${n} permisos`,
    clickCycleLine1: "Haz clic en un día para cambiar:",
    clickCycleLine2: "ninguna → Vacaciones → Permiso",
  },
};
