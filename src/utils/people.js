/** Genera un ID casuale breve. */
export const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * "Giulia Rossi" → "Giulia R."
 * Un solo token → restituito invariato.
 * Stringa vuota → "—"
 */
export function displayName(name) {
  const trimmed = name.trim();
  if (!trimmed) return "—";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/** "Giulia Rossi" → "GR" — "Giulia" → "G" — "" → "?" */
export function initials(name) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Colore deterministico basato sull'indice della persona nell'array.
 * Restituisce { bg, text, border } in hsl.
 */
export function personColor(personId, people) {
  const idx = Math.max(0, people.findIndex((p) => p.id === personId));
  const hue = (idx * 53 + 25) % 360;
  return {
    bg:     `hsl(${hue}, 38%, 90%)`,
    text:   `hsl(${hue}, 55%, 22%)`,
    border: `hsl(${hue}, 35%, 70%)`,
  };
}
