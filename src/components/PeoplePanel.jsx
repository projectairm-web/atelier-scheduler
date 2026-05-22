import { Wand2, Trash2, Download, CalendarDays, Settings } from "lucide-react";
import { personColor, initials, displayName } from "../utils/people.js";
import { useTranslation } from "../i18n/index.jsx";

export default function PeoplePanel({
  people, weekDayCounts,
  onGenerate, onClear, onExport,
  onAbsences, onSettings,
}) {
  const { t } = useTranslation();

  return (
    <div className="people-panel">
      <div className="panel-card">
        <div className="panel-title">{t.staffTitle}</div>
        {people.map(person => {
          const used = weekDayCounts[person.id] || 0;
          const pct  = Math.min(100, (used / person.maxDays) * 100);
          const full = used >= person.maxDays;
          const over = used > person.maxDays;
          const { bg, text, border } = personColor(person.id, people);

          return (
            <div key={person.id} className="person-row">
              <div
                className="person-avatar"
                style={{ background: bg, color: text, border: `1px solid ${border}` }}
              >
                {initials(person.name)}
              </div>
              <div className="person-info">
                <div className="pname">{displayName(person.name)}</div>
                <div className="pdays">{t.daysOf(used, person.maxDays)}</div>
                <div className="days-bar">
                  <div
                    className={`days-bar-fill${over ? " over" : full ? " full" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="actions-card">
        <button className="btn btn-primary" onClick={onGenerate}>
          <Wand2 size={14} />
          {t.generate}
        </button>
        <button className="btn btn-ghost" onClick={onExport}>
          <Download size={14} />
          {t.exportExcel}
        </button>
        <button className="btn btn-ghost" onClick={onClear}>
          <Trash2 size={14} />
          {t.clearWeek}
        </button>

        {/* Only visible on mobile (hidden on desktop via CSS) */}
        {onAbsences && (
          <button className="btn btn-ghost panel-mobile-only" onClick={onAbsences}>
            <CalendarDays size={14} />
            {t.absences}
          </button>
        )}
        {onSettings && (
          <button className="btn btn-ghost panel-mobile-only" onClick={onSettings}>
            <Settings size={14} />
            {t.settings}
          </button>
        )}
      </div>

      <div style={{ padding: "0 4px" }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{t.legend}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { color: "#f59e0b",       label: t.understaffed },
            { color: "var(--red)",    label: t.legendCritical },
            { color: "var(--blue)",   label: t.legendNormal },
            { color: "#166534",       label: t.leaveLabel },
            { color: "#92400e",       label: t.permissionLabel },
          ].map(({ color, label }) => (
            <div key={label} className="legend-item">
              <span className="legend-dot" style={{ background: color }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
