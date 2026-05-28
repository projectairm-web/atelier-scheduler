import { useState } from "react";
import { X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { personColor, initials, displayName } from "../utils/people.js";
import { useTranslation } from "../i18n/index.jsx";

/* ── Helpers ─────────────────────────────────────────────── */
function cycleAbsence(current) {
  if (!current)            return "ferie";
  if (current === "ferie") return "permesso";
  return null;
}

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function calendarCells(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirst    = new Date(year, month, 1).getDay();
  const firstCol    = rawFirst === 0 ? 6 : rawFirst - 1;
  const cells       = Array(firstCol).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function monthPrefix(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}-`;
}

/* ── Main component ──────────────────────────────────────── */
export default function AbsenceCalendar({ people, absences, onToggle, onClose }) {
  const { t } = useTranslation();
  const now  = new Date();

  const [selId,  setSelId]  = useState(people[0]?.id ?? null);
  const [year,   setYear]   = useState(now.getFullYear());
  const [month,  setMonth]  = useState(now.getMonth());

  // If the selected person was deleted while the modal is open, fall back to first
  const selIdSafe = people.find(p => p.id === selId) ? selId : (people[0]?.id ?? null);

  // Build absence type config from translations
  const ABSENCE = {
    ferie:    { label: t.leaveLabel,      short: t.leaveShort,      color: "#166534", bg: "#dcfce7", border: "#86efac" },
    permesso: { label: t.permissionLabel, short: t.permissionShort, color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  };

  const personAbsences = absences[selIdSafe] ?? {};
  const cells          = calendarCells(year, month);
  const prefix         = monthPrefix(year, month);

  const countFerie    = Object.entries(personAbsences).filter(([k, v]) => k.startsWith(prefix) && v === "ferie").length;
  const countPermesso = Object.entries(personAbsences).filter(([k, v]) => k.startsWith(prefix) && v === "permesso").length;

  const prevMonth = () => month === 0  ? (setYear(y => y - 1), setMonth(11))  : setMonth(m => m - 1);
  const nextMonth = () => month === 11 ? (setYear(y => y + 1), setMonth(0))   : setMonth(m => m + 1);

  const todayY = now.getFullYear(), todayM = now.getMonth(), todayD = now.getDate();

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absence-modal">

        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={18} color="var(--accent)" />
            <h2 className="settings-title">{t.absencesTitle}</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="absence-body">

          {/* ── Sidebar — people list ── */}
          <div className="absence-sidebar">
            {people.map(p => {
              const { bg, text, border } = personColor(p.id, people);
              const total = Object.keys(absences[p.id] ?? {}).length;
              return (
                <div
                  key={p.id}
                  className={`absence-person-row${p.id === selIdSafe ? " selected" : ""}`}
                  onClick={() => setSelId(p.id)}
                >
                  <div
                    className="person-avatar"
                    style={{ background: bg, color: text, border: `1px solid ${border}`, width: 28, height: 28, fontSize: 11 }}
                  >
                    {initials(p.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="pname">{displayName(p.name)}</div>
                    {total > 0 && <div className="pdays">{t.totalAbsences(total)}</div>}
                  </div>
                </div>
              );
            })}

            <div className="absence-legend">
              {Object.entries(ABSENCE).map(([key, val]) => (
                <div key={key} className="legend-item">
                  <span className="legend-dot" style={{ background: val.color }} />
                  <span>{val.short} = {val.label}</span>
                </div>
              ))}
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4 }}>
                {t.clickCycleLine1}<br />{t.clickCycleLine2}
              </div>
            </div>
          </div>

          {/* ── Calendar ── */}
          <div className="absence-calendar">
            <div className="cal-nav">
              <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={15} /></button>
              <span className="cal-month-label">{t.months[month]} {year}</span>
              <button className="btn-icon" onClick={nextMonth}><ChevronRight size={15} /></button>
            </div>

            {(countFerie > 0 || countPermesso > 0) && (
              <div className="cal-stats">
                {countFerie    > 0 && <span className="cal-stat" style={{ background: ABSENCE.ferie.bg,    color: ABSENCE.ferie.color,    border: `1px solid ${ABSENCE.ferie.border}` }}>{t.leaveStat(countFerie)}</span>}
                {countPermesso > 0 && <span className="cal-stat" style={{ background: ABSENCE.permesso.bg, color: ABSENCE.permesso.color, border: `1px solid ${ABSENCE.permesso.border}` }}>{t.permStat(countPermesso)}</span>}
              </div>
            )}

            <div className="cal-grid">
              {t.days.map(d => (
                <div key={d} className="cal-header-cell">{d}</div>
              ))}

              {cells.map((day, i) => {
                if (!day) return <div key={i} className="cal-cell cal-empty" />;
                const iso     = toISO(year, month, day);
                const absence = personAbsences[iso];
                const aType   = absence ? ABSENCE[absence] : null;
                const isToday = year === todayY && month === todayM && day === todayD;

                return (
                  <div
                    key={i}
                    className={`cal-cell${isToday ? " cal-today" : ""}${aType ? " cal-absent" : ""}`}
                    style={aType ? { background: aType.bg, borderColor: aType.border } : {}}
                    onClick={() => onToggle(selIdSafe, iso, cycleAbsence(absence))}
                    title={aType ? aType.label : ""}
                  >
                    <span className="cal-day-num" style={aType ? { color: aType.color, fontWeight: 700 } : {}}>
                      {day}
                    </span>
                    {aType && (
                      <span className="cal-absence-badge" style={{ background: aType.color }}>
                        {aType.short}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
