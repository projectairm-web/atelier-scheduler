import { X, TrendingUp } from "lucide-react";
import { weekKey, addDays, getMondayOf } from "../utils/date.js";
import { countPersonWeekDays } from "../App.jsx";
import { useTranslation } from "../i18n/index.jsx";

function getRecentWeekKeys(currentMonday, schedules, n = 8) {
  const keys = [];
  for (let i = 0; i < n; i++) {
    const monday = addDays(currentMonday, -i * 7);
    const key = weekKey(monday);
    if (schedules[key]) keys.push(key);
  }
  return keys;
}

export default function StatsModal({ stores, people, schedules, currentMonday, weekDayCounts, onClose }) {
  const { t } = useTranslation();

  const wk           = weekKey(currentMonday);
  const weekSchedule = schedules[wk] || {};
  const recentKeys   = getRecentWeekKeys(currentMonday, schedules);
  const hasHistory   = recentKeys.length > 1;

  // Per-person stats
  const personStats = people.map(p => {
    const thisWeek = weekDayCounts[p.id] || 0;
    const totalDays = recentKeys.reduce((sum, k) => sum + countPersonWeekDays(schedules[k], p.id), 0);
    const avgDays   = hasHistory ? (totalDays / recentKeys.length).toFixed(1) : null;
    return { person: p, thisWeek, avgDays };
  }).sort((a, b) => b.thisWeek - a.thisWeek);

  // Per-store stats (active stores only)
  const storeStats = stores.filter(s => !s.closed).map(store => {
    const fullDays = [0,1,2,3,4,5,6].filter(d =>
      (weekSchedule[d]?.[store.id]?.length || 0) >= store.staffNeeded
    ).length;
    const anyDays = [0,1,2,3,4,5,6].filter(d =>
      (weekSchedule[d]?.[store.id]?.length || 0) > 0
    ).length;
    return { store, fullDays, anyDays };
  });

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-modal stats-modal">
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent)" />
            <h2 className="settings-title">{t.statsTitle}</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="stats-body">

          {/* ── People ── */}
          <div className="stats-section">
            <div className="stats-section-label">{t.staffTitle}</div>
            {personStats.map(({ person, thisWeek, avgDays }) => {
              const pct = Math.min(100, (thisWeek / person.maxDays) * 100);
              const full = thisWeek >= person.maxDays;
              return (
                <div key={person.id} className="stats-row">
                  <div className="stats-name">{person.name || "—"}</div>
                  <div className="stats-bar-wrap">
                    <div className="stats-bar">
                      <div
                        className={`stats-bar-fill${full ? " full" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="stats-num">{thisWeek}/{person.maxDays}</span>
                  </div>
                  {avgDays !== null && (
                    <span className="stats-avg">avg {avgDays}d</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Stores ── */}
          <div className="stats-section">
            <div className="stats-section-label">{t.storeCol}</div>
            {storeStats.map(({ store, fullDays, anyDays }) => (
              <div key={store.id} className="stats-row">
                <div className="stats-name">{store.name}</div>
                <div className="stats-coverage-wrap">
                  <div className="stats-coverage-bar">
                    {[0,1,2,3,4,5,6].map(d => {
                      const count = weekSchedule[d]?.[store.id]?.length || 0;
                      const status = count === 0 ? "empty"
                        : count >= store.staffNeeded ? "full"
                        : "partial";
                      return <div key={d} className={`cov-day cov-${status}`} />;
                    })}
                  </div>
                  <span className="stats-num">{fullDays}/7</span>
                </div>
              </div>
            ))}
          </div>

          {hasHistory && (
            <div className="stats-footer-note">
              {t.statsBasedOn(recentKeys.length)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}