import { CalendarRange, Users } from "lucide-react";
import { useTranslation } from "../i18n/index.jsx";

export default function BottomNav({ active, onChange }) {
  const { t } = useTranslation();

  const tabs = [
    { id: "schedule", icon: <CalendarRange size={24} />, label: t.tabSchedule },
    { id: "people",   icon: <Users size={24} />,         label: t.tabStaff },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`bottom-tab${tab.id === active ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
