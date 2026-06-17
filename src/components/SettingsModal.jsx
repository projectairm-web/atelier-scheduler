import { useState } from "react";
import { X, Plus, Trash2, Store, Users, PowerOff } from "lucide-react";
import { uid } from "../utils/people.js";
import { useTranslation } from "../i18n/index.jsx";

/* ── Stores Tab ─────────────────────────────────────────── */
function StoresTab({ stores, onUpdate, onAdd, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="stab-content">
      <div className="stab-list">
        {stores.map(store => (
          <div key={store.id} className="stab-row">
            <div className="stab-fields">
              <div className="field-group">
                <label className="field-label">{t.storeName}</label>
                <input
                  className="field-input"
                  value={store.name}
                  onChange={e => onUpdate(store.id, { name: e.target.value })}
                  placeholder={t.storeNamePh}
                />
              </div>
              <div className="field-group field-sm">
                <label className="field-label">{t.city}</label>
                <input
                  className="field-input"
                  value={store.city}
                  onChange={e => onUpdate(store.id, { city: e.target.value })}
                  placeholder={t.cityPh}
                />
              </div>
              <div className="field-group field-sm">
                <label className="field-label">{t.priority}</label>
                <select
                  className="field-select"
                  value={store.priority}
                  onChange={e => onUpdate(store.id, { priority: e.target.value })}
                >
                  <option value="critica">{t.criticalOpt}</option>
                  <option value="normale">{t.normalOpt}</option>
                </select>
              </div>
              <div className="field-group field-xs">
                <label className="field-label">{t.staffNeeded}</label>
                <input
                  className="field-input"
                  type="number"
                  min={1} max={10}
                  value={store.staffNeeded}
                  onFocus={e => e.target.select()}
                  onChange={e => { const n = parseInt(e.target.value, 10); if (n >= 1) onUpdate(store.id, { staffNeeded: Math.min(10, n) }); }}
                  onBlur={e => { if (!e.target.value || parseInt(e.target.value, 10) < 1) onUpdate(store.id, { staffNeeded: 1 }); }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                className={`row-closed-toggle${store.closed ? " closed" : ""}`}
                title={store.closed ? t.openStore : t.closedStore}
                onClick={() => onUpdate(store.id, { closed: !store.closed })}
              >
                <PowerOff size={13} />
              </button>
              <button
                className="row-delete"
                onClick={() => onDelete(store.id)}
                disabled={stores.length <= 1}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={onAdd}>
        <Plus size={14} />
        {t.addStore}
      </button>
    </div>
  );
}

/* ── People Tab ─────────────────────────────────────────── */
function PeopleTab({ people, stores, onUpdate, onAdd, onDelete }) {
  const { t } = useTranslation();

  function toggleDay(person, dayIdx) {
    const current = person.availability ?? [];
    const isAll   = current.length === 0;
    const base    = isAll ? [0, 1, 2, 3, 4, 5, 6] : [...current];
    const next    = base.includes(dayIdx)
      ? base.filter(d => d !== dayIdx)
      : [...base, dayIdx].sort((a, b) => a - b);
    onUpdate(person.id, { availability: next.length === 7 ? [] : next });
  }

  function isDayAvailable(person, dayIdx) {
    const av = person.availability ?? [];
    return av.length === 0 || av.includes(dayIdx);
  }

  function toggleBlockedStore(person, storeId) {
    const current = person.blockedStores ?? [];
    const next    = current.includes(storeId)
      ? current.filter(id => id !== storeId)
      : [...current, storeId];
    onUpdate(person.id, { blockedStores: next });
  }

  function isStoreBlocked(person, storeId) {
    return (person.blockedStores ?? []).includes(storeId);
  }

  return (
    <div className="stab-content">
      <div className="stab-list">
        {people.map(person => (
          <div key={person.id} className="stab-row stab-row-people">
            <div className="stab-fields stab-fields-people">
              <div className="field-group">
                <label className="field-label">{t.nameLabel}</label>
                <input
                  className="field-input"
                  value={person.name}
                  onChange={e => onUpdate(person.id, { name: e.target.value })}
                  placeholder={t.nameLabel}
                />
              </div>
              <div className="field-group field-xs">
                <label className="field-label">{t.maxDaysLabel}</label>
                <input
                  className="field-input"
                  type="number"
                  min={1} max={7}
                  value={person.maxDays}
                  onFocus={e => e.target.select()}
                  onChange={e => { const n = parseInt(e.target.value, 10); if (n >= 1) onUpdate(person.id, { maxDays: Math.min(7, n) }); }}
                  onBlur={e => { if (!e.target.value || parseInt(e.target.value, 10) < 1) onUpdate(person.id, { maxDays: 1 }); }}
                />
              </div>
              <div className="field-group field-grow">
                <label className="field-label">{t.availability}</label>
                <div className="day-checks">
                  {t.days.map((label, i) => {
                    const on = isDayAvailable(person, i);
                    return (
                      <button
                        key={i}
                        className={`day-check-btn${on ? " day-on" : " day-off"}`}
                        onClick={() => toggleDay(person, i)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {stores.length > 0 && (
                <div className="field-group field-grow">
                  <label className="field-label">{t.blockedStores}</label>
                  <div className="day-checks">
                    {stores.map(store => {
                      const blocked = isStoreBlocked(person, store.id);
                      return (
                        <button
                          key={store.id}
                          className={`day-check-btn store-block-btn${blocked ? " day-off blocked" : " day-on"}`}
                          onClick={() => toggleBlockedStore(person, store.id)}
                          title={store.name}
                        >
                          {store.name.length > 6 ? store.name.slice(0, 5) + "…" : store.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="field-group field-sm">
                <label className="field-label">{t.notesLabel}</label>
                <input
                  className="field-input"
                  value={person.notes ?? ""}
                  onChange={e => onUpdate(person.id, { notes: e.target.value })}
                  placeholder={t.notesPh}
                />
              </div>
            </div>
            <button
              className="row-delete"
              onClick={() => onDelete(person.id)}
              disabled={people.length <= 1}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button className="add-row-btn" onClick={onAdd}>
        <Plus size={14} />
        {t.addPerson}
      </button>
    </div>
  );
}

/* ── Settings Modal ─────────────────────────────────────── */
export default function SettingsModal({
  stores, people,
  onUpdateStore, onAddStore, onDeleteStore,
  onUpdatePerson, onAddPerson, onDeletePerson,
  onClose,
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState("stores");

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-modal">
        <div className="settings-header">
          <h2 className="settings-title">{t.settingsTitle}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab${tab === "stores" ? " active" : ""}`}
            onClick={() => setTab("stores")}
          >
            <Store size={14} />
            {t.storesTab(stores.length)}
          </button>
          <button
            className={`settings-tab${tab === "people" ? " active" : ""}`}
            onClick={() => setTab("people")}
          >
            <Users size={14} />
            {t.peopleTab(people.length)}
          </button>
        </div>

        {tab === "stores" ? (
          <StoresTab
            stores={stores}
            onUpdate={onUpdateStore}
            onAdd={onAddStore}
            onDelete={onDeleteStore}
          />
        ) : (
          <PeopleTab
            people={people}
            stores={stores}
            onUpdate={onUpdatePerson}
            onAdd={onAddPerson}
            onDelete={onDeletePerson}
          />
        )}

        <div className="settings-footer">{t.autoSave}</div>
      </div>
    </div>
  );
}