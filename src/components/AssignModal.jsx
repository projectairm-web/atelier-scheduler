import { X, Check } from "lucide-react";
import { addDays, toLocalDateStr } from "../utils/date.js";
import { personColor, initials, displayName } from "../utils/people.js";
import { useTranslation } from "../i18n/index.jsx";

export default function AssignModal({
  day, storeId, stores, people,
  weekSchedule, weekDayCounts,
  currentMonday, absences,
  onToggle, onClose,
}) {
  const { t } = useTranslation();

  const store    = stores.find(s => s.id === storeId);
  const assigned = weekSchedule[day]?.[storeId] || [];
  // Use local date string to match absence keys (fixes UTC timezone bug)
  const dateStr  = toLocalDateStr(addDays(currentMonday, day));

  const elsewhereToday = new Set(
    Object.entries(weekSchedule[day] || {})
      .filter(([sid]) => sid !== storeId)
      .flatMap(([, ids]) => ids)
  );

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{store?.name}</div>
            <div className="modal-sub">
              {t.days[day]} — {t.assignSub(store?.staffNeeded)}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="modal-list">
          {people.map(person => {
            const { bg, text, border } = personColor(person.id, people);
            const isAssigned    = assigned.includes(person.id);
            const isElsewhere   = elsewhereToday.has(person.id);
            const isFull        = !isAssigned && (weekDayCounts[person.id] || 0) >= person.maxDays;
            const av            = person.availability ?? [];
            const isUnavailable = !isAssigned && av.length > 0 && !av.includes(day);
            const absenceType   = !isAssigned && absences[person.id]?.[dateStr];
            const isBlocked     = !isAssigned && (person.blockedStores ?? []).includes(storeId);
            const disabled      = isElsewhere || isFull || isUnavailable || !!absenceType || isBlocked;

            let meta;
            if (isBlocked)                  meta = t.blockedFromStore;
            else if (absenceType === "ferie") meta = t.onLeave;
            else if (absenceType)            meta = t.onPermission;
            else if (isUnavailable)          meta = t.unavailableDay;
            else if (isElsewhere)            meta = t.alreadyToday;
            else if (isFull)                 meta = t.maxReached(person.maxDays);
            else                             meta = t.daysCount(weekDayCounts[person.id] || 0, person.maxDays);

            return (
              <div
                key={person.id}
                className={
                  "modal-person" +
                  (isAssigned ? " mp-assigned" : "") +
                  (disabled   ? " mp-disabled"  : "")
                }
                onClick={() => !disabled && onToggle(day, storeId, person.id)}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: bg, color: text, border: `1px solid ${border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, flexShrink: 0,
                  }}
                >
                  {initials(person.name)}
                </div>
                <div className="mp-info">
                  <div className="mp-name">{displayName(person.name)}</div>
                  <div className="mp-meta">{meta}</div>
                </div>
                {isAssigned && (
                  <span className="mp-check">
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}