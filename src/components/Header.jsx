import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Settings, CalendarDays, Sun, Moon } from "lucide-react";
import { useTranslation } from "../i18n/index.jsx";

const LANG_LABELS = { it: "IT", en: "EN", es: "ES" };

/* ── Theme hook (self-contained) ────────────────────────── */
function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("atelier-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("atelier-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark];
}

/* ── Header ─────────────────────────────────────────────── */
export default function Header({ weekRange, onPrev, onNext, onToday, onSettings, onAbsences }) {
  const { t, lang, setLang, SUPPORTED } = useTranslation();
  const [dark, setDark] = useTheme();

  return (
    <header className="header">
      <div className="header-brand">
        <span className="brand-dot" />
        <span className="brand-name">Atelier</span>
        <span className="brand-sub">{t.brandSub}</span>
      </div>

      <div className="week-nav">
        <button className="btn-icon" onClick={onPrev} title="←">
          <ChevronLeft size={15} />
        </button>
        <span className="week-label">{weekRange}</span>
        <button className="btn-icon" onClick={onNext} title="→">
          <ChevronRight size={15} />
        </button>
        <button className="btn-today" onClick={onToday}>
          {t.today}
        </button>
      </div>

      <div className="header-actions">
        {/* Language switcher */}
        <div className="lang-switcher">
          {SUPPORTED.map(l => (
            <button
              key={l}
              className={`lang-btn${l === lang ? " active" : ""}`}
              onClick={() => setLang(l)}
              title={l.toUpperCase()}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>

        {/* Dark / Light toggle */}
        <button
          className="btn-icon btn-theme"
          onClick={() => setDark(d => !d)}
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Absences — icon+label on desktop, icon-only on mobile */}
        <button className="btn-settings" onClick={onAbsences}>
          <CalendarDays size={15} />
          <span className="btn-label">{t.absences}</span>
        </button>

        {/* Settings — icon+label on desktop, icon-only on mobile */}
        <button className="btn-settings" onClick={onSettings}>
          <Settings size={15} />
          <span className="btn-label">{t.settings}</span>
        </button>
      </div>
    </header>
  );
}
