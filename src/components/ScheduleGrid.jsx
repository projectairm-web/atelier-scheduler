import { Users } from "lucide-react";
import { addDays } from "../utils/date.js";
import { personColor, initials, displayName } from "../utils/people.js";
import { useTranslation } from "../i18n/index.jsx";

function getTodayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function ScheduleGrid({
  stores, people, weekSchedule, currentMonday, absences, onCellClick,
}) {
  const { t } = useTranslation();
  // Recomputed on each render so it stays correct if the app is open past midnight
  const todayMidnight = getTodayMidnight();

  return (
    <div className="schedule-wrap">
      <table className="grid-table">
        <thead>
          <tr>
            <th className="store-col">{t.storeCol}</th>
            {t.days.map((label, i) => {
              const d = addDays(currentMonday, i);
              const isToday = sameDay(d, todayMidnight);
              return (
                <th key={i} className={isToday ? "today-col" : ""}>
                  <div>{label}</div>
                  <div style={{ fontWeight: 400, fontSize: 12, opacity: 0.75, marginTop: 1 }}>
                    {d.getDate()}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {stores.map(store => (
            <tr key={store.id} className={store.closed ? "store-row-closed" : ""}>
              <td className="store-cell">
                <div className="store-name">{store.name}</div>
                <div className="store-city">{store.city}</div>
                <div className="store-footer">
                  {store.closed ? (
                    <span className="badge badge-closed">{t.closedStore}</span>
                  ) : (
                    <>
                      <span className={`badge badge-${store.priority}`}>
                        {store.priority === "critica" ? t.critical : t.normal}
                      </span>
                      <span className="staff-needed">
                        <Users size={9} />
                        {store.staffNeeded}
                      </span>
                    </>
                  )}
                </div>
              </td>

              {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                if (store.closed) {
                  return (
                    <td key={dayIdx}>
                      <div className="day-cell day-cell-closed" />
                    </td>
                  );
                }

                const d = addDays(currentMonday, dayIdx);
                const isToday = sameDay(d, todayMidnight);
                const assigned = weekSchedule[dayIdx]?.[store.id] || [];
                const understaffed = assigned.length > 0 && assigned.length < store.staffNeeded;

                return (
                  <td key={dayIdx}>
                    <div
                      className={
                        "day-cell" +
                        (isToday ? " today-cell" : "") +
                        (understaffed ? " understaffed" : "")
                      }
                      onClick={() => onCellClick(dayIdx, store.id)}
                    >
                      {assigned.length === 0 ? (
                        <span className="empty-hint">+</span>
                      ) : (
                        assigned.map(pid => {
                          const person = people.find(p => p.id === pid);
                          if (!person) return null;
                          const { bg, text, border } = personColor(pid, people);
                          return (
                            <span
                              key={pid}
                              className="person-chip"
                              style={{ background: bg, color: text, borderColor: border }}
                              title={person.name}
                            >
                              <span
                                className="chip-avatar"
                                style={{ background: text + "28", color: text }}
                              >
                                {initials(person.name)}
                              </span>
                              <span className="chip-label">
                                {displayName(person.name)}
                              </span>
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
