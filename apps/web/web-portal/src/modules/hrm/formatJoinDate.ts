/** Safe vi-VN join date for HRM API rows (avoids epoch 01/01/1970). */
export function formatJoinDateVi(value: string | null | undefined): string {
  if (!value || value === '0') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return '—';
  return d.toLocaleDateString('vi-VN');
}
