// Parse an HTML <input type="date"> value (YYYY-MM-DD) into a *UTC* Date safely.
export function parseISODateOnly(value: string | undefined | null): Date | null {
  if (!value) return null;
  // Strict pattern YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  // Always construct as UTC to avoid off‑by‑one in local timezones
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
}