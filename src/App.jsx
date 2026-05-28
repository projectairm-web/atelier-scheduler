import { useState, useEffect } from "react";
import { STORAGE_KEY, SEED } from "./constants/index.js";
import { getMondayOf, addDays, weekKey, formatWeekRange, toLocalDateStr } from "./utils/date.js";
import { uid } from "./utils/people.js";
import { generateSchedule } from "./algorithms/scheduler.js";
import { exportWeekToExcel } from "./utils/export.js";
import { useTranslation } from "./i18n/index.jsx";
import Header from "./components/Header.jsx";
import ScheduleGrid from "./components/ScheduleGrid.jsx";
import PeoplePanel from "./components/PeoplePanel.jsx";
import AssignModal from "./components/AssignModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import AbsenceCalendar from "./components/AbsenceCalendar.jsx";
import BottomNav from "./components/BottomNav.jsx";

/* ── Persistence ────────────────────────────────────────── */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure absences key exists for older saves
      return { absences: {}, ...parsed };
    }
  } catch {}
  return { stores: SEED.stores, people: SEED.people, schedules: {}, absences: {} };
}

/* ── Helpers ─────────────────────────────────────────────── */
export function countPersonWeekDays(weekSched, personId) {
  if (!weekSched) return 0;
  let count = 0;
  for (let d = 0; d < 7; d++) {
    for (const sid in weekSched[d] || {}) {
      if ((weekSched[d][sid] || []).includes(personId)) count++;
    }
  }
  return count;
}

/* ── Root Component ─────────────────────────────────────── */
export default function App() {
  const { t } = useTranslation();
  const [state, setState] = useState(loadState);
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOf(new Date()));
  const [modal,         setModal]         = useState(null);  // { day, storeId }
  const [showSettings,  setShowSettings]  = useState(false);
  const [showAbsences,  setShowAbsences]  = useState(false);
  const [activeTab,     setActiveTab]     = useState("schedule");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const wk           = weekKey(currentMonday);
  const weekSchedule = state.schedules[wk] || {};

  // ── Week navigation
  const prevWeek = () => setCurrentMonday(d => addDays(d, -7));
  const nextWeek = () => setCurrentMonday(d => addDays(d, 7));
  const goToday  = () => setCurrentMonday(getMondayOf(new Date()));

  // ── Schedule actions
  const handleGenerate = () => {
    const generated = generateSchedule(
      { stores: state.stores, people: state.people },
      { monday: currentMonday, absences: state.absences }
    );
    setState(s => ({ ...s, schedules: { ...s.schedules, [wk]: generated } }));
  };

  const handleClear = () => {
    setState(s => {
      const schedules = { ...s.schedules };
      delete schedules[wk];
      return { ...s, schedules };
    });
  };

  // ── Export
  const handleExport = async () => {
    try {
      await exportWeekToExcel({
        stores: state.stores,
        people: state.people,
        weekSchedule,
        monday: currentMonday,
      });
    } catch (err) {
      console.error("Export failed:", err);
      alert("Errore durante l'esportazione: " + (err?.message ?? err));
    }
  };

  // ── Toggle person in a slot
  const toggleAssignment = (day, storeId, personId) => {
    setState(s => {
      const ws      = s.schedules[wk] || {};
      const current = ws[day]?.[storeId] || [];
      let next;

      if (current.includes(personId)) {
        next = current.filter(id => id !== personId);
      } else {
        const allThisDay = Object.values(ws[day] || {}).flat();
        if (allThisDay.includes(personId)) return s;

        const weekCount = countPersonWeekDays(ws, personId);
        const person    = s.people.find(p => p.id === personId);
        if (weekCount >= person.maxDays) return s;

        const av = person.availability ?? [];
        if (av.length > 0 && !av.includes(day)) return s;

        // Check absence for this specific date (local date, not UTC)
        const dateStr = toLocalDateStr(addDays(currentMonday, day));
        if (s.absences[personId]?.[dateStr]) return s;

        next = [...current, personId];
      }

      return {
        ...s,
        schedules: {
          ...s.schedules,
          [wk]: { ...ws, [day]: { ...(ws[day] || {}), [storeId]: next } },
        },
      };
    });
  };

  // ── Absence toggle
  const toggleAbsence = (personId, dateStr, absenceType) => {
    setState(s => {
      const personAbs = { ...(s.absences[personId] || {}) };
      if (!absenceType) {
        delete personAbs[dateStr];
      } else {
        personAbs[dateStr] = absenceType;
      }
      return { ...s, absences: { ...s.absences, [personId]: personAbs } };
    });
  };

  // ── Store CRUD
  const updateStore  = (id, patch) =>
    setState(s => ({ ...s, stores: s.stores.map(st => st.id === id ? { ...st, ...patch } : st) }));

  const addStore = () =>
    setState(s => ({
      ...s,
      stores: [...s.stores, { id: uid(), name: "", city: "", priority: "normale", staffNeeded: 1 }],
    }));

  const deleteStore = (id) =>
    setState(s => ({
      ...s,
      stores: s.stores.filter(st => st.id !== id),
      schedules: Object.fromEntries(
        Object.entries(s.schedules).map(([wk, ws]) => [
          wk,
          Object.fromEntries(
            Object.entries(ws).map(([day, byStore]) => [
              day,
              Object.fromEntries(Object.entries(byStore).filter(([sid]) => sid !== id)),
            ])
          ),
        ])
      ),
    }));

  // ── People CRUD
  const updatePerson = (id, patch) =>
    setState(s => ({ ...s, people: s.people.map(p => p.id === id ? { ...p, ...patch } : p) }));

  const addPerson = () =>
    setState(s => ({
      ...s,
      people: [...s.people, { id: uid(), name: "", maxDays: 5, notes: "", availability: [] }],
    }));

  const deletePerson = (id) =>
    setState(s => {
      const absences = { ...s.absences };
      delete absences[id];
      return {
        ...s,
        people: s.people.filter(p => p.id !== id),
        absences,
        schedules: Object.fromEntries(
          Object.entries(s.schedules).map(([wk, ws]) => [
            wk,
            Object.fromEntries(
              Object.entries(ws).map(([day, byStore]) => [
                day,
                Object.fromEntries(
                  Object.entries(byStore).map(([sid, ids]) => [sid, ids.filter(pid => pid !== id)])
                ),
              ])
            ),
          ])
        ),
      };
    });

  // Per-person day counts for this week
  const weekDayCounts = {};
  state.people.forEach(p => {
    weekDayCounts[p.id] = countPersonWeekDays(weekSchedule, p.id);
  });

  return (
    <div className="app">
      <Header
        weekRange={formatWeekRange(currentMonday, t.locale)}
        onPrev={prevWeek}
        onNext={nextWeek}
        onToday={goToday}
        onSettings={() => setShowSettings(true)}
        onAbsences={() => setShowAbsences(true)}
      />

      <div className="main">
        <div className={`tab-pane tab-schedule${activeTab === "schedule" ? " tab-active" : ""}`}>
          <ScheduleGrid
            stores={state.stores}
            people={state.people}
            weekSchedule={weekSchedule}
            currentMonday={currentMonday}
            absences={state.absences}
            onCellClick={(day, storeId) => setModal({ day, storeId })}
          />
        </div>
        <div className={`tab-pane tab-people${activeTab === "people" ? " tab-active" : ""}`}>
          <PeoplePanel
            people={state.people}
            weekDayCounts={weekDayCounts}
            onGenerate={handleGenerate}
            onClear={handleClear}
            onExport={handleExport}
            onAbsences={() => setShowAbsences(true)}
            onSettings={() => setShowSettings(true)}
          />
        </div>
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {modal && (
        <AssignModal
          day={modal.day}
          storeId={modal.storeId}
          stores={state.stores}
          people={state.people}
          weekSchedule={weekSchedule}
          weekDayCounts={weekDayCounts}
          currentMonday={currentMonday}
          absences={state.absences}
          onToggle={toggleAssignment}
          onClose={() => setModal(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          stores={state.stores}
          people={state.people}
          onUpdateStore={updateStore}
          onAddStore={addStore}
          onDeleteStore={deleteStore}
          onUpdatePerson={updatePerson}
          onAddPerson={addPerson}
          onDeletePerson={deletePerson}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAbsences && (
        <AbsenceCalendar
          people={state.people}
          absences={state.absences}
          onToggle={toggleAbsence}
          onClose={() => setShowAbsences(false)}
        />
      )}
    </div>
  );
}
